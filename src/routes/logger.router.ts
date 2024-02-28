// External Dependencies
import express, { Request, Response } from "express";
import { ObjectId } from 'bson'
import { collections } from "../services/database.service";
import Logger from "../models/logger";
import LogEntry from "../models/logentry";
import SLogger from "../lib/logger";
import { Sort, WithId } from "mongodb";
import { AsyncParser } from "@json2csv/node";
import LogEntryData from '../validation/logentrySchema';
import z from 'zod';



// Global Config
export const loggerRouter = express.Router();

loggerRouter.use(express.json());


async function createLogger(req: Request, res: Response) {
    let doc = new Logger(Date.now());
    if (typeof req.body.name === 'string') {
        doc.name = req.body.name;
    }
    const result = await collections.loggers?.insertOne(doc);
    SLogger.info(`A logger was inserted with id: ${result?.insertedId}`);
    res.status(200).json({
        loggerId: result?.insertedId,
        message: 'Logger created'
    });
}


// GET
loggerRouter.get('/logger/start', async (req: Request, res: Response) => {
    try {
        createLogger(req, res);
    } catch(error) {
        res.status(500).send((error as Error).message);
    }
});

loggerRouter.get('/logs/:loggerId', async (req: Request, res: Response) => {
    try {
        let output: any = {};
        const loggerId = new ObjectId(req.params.loggerId);
        const logger: Logger = ((await collections.loggers?.find({ _id: loggerId }).toArray() as WithId<Document>[])[0] as unknown as Logger);
        SLogger.debug(`${logger.createdTs}`);
        output.loggerId = loggerId;
        output.createdTs = logger.createdTs
        if(typeof logger.name === 'string') {
            output.name = logger.name;
        }
        const query = {logger_id: loggerId};
        let sort: Sort = {ts: 1};
        const sortInput = req.query.sort;
        if(parseInt(sortInput as string) == -1 || (sortInput as string) == 'desc') {
            sort.ts = -1;
        }
        const result = await collections.logs?.find(query).sort(sort).toArray();
        output.count = result?.length;
        output.logs = result;
        SLogger.debug(`${result?.length} document(s) returned from ${req.route.path}`);

        //format query
        const format = req.query.format;
        if(format == 'csv'){
            const opts = {
                fields:['logger_id', '_id', 'ts', 'message'],
            };
            const parser = new AsyncParser(opts);
            const csv = await parser .parse(output.logs).promise();
            SLogger.debug(csv);
            res.attachment(`${loggerId}-${Date.now()}.csv`).send(csv);
        } else {
            res.json(output);
        }
    } catch(error) {
        res.status(500).send((error as Error).message);
    }
});

loggerRouter.get('/logger/all', async (req: Request, res: Response) => {
    try {
        const result = await collections.loggers?.find({}).toArray();
        SLogger.debug(`${result?.length} document(s) returned from ${req.route.path}`);
        res.json(result);
    } catch(error) {
        res.status(500).send((error as Error).message);
    }
});


// POST
loggerRouter.post('/log', async (req: Request, res: Response) => {
    try {
        let logEntry = req.body as LogEntry;
        const loggerId = new ObjectId(logEntry.logger_id);
        const query = {_id: loggerId};
        const n = await collections.loggers?.countDocuments(query);
        SLogger.debug(`${n} Logger found with _id:${loggerId}`);
        if (n != undefined && n > 0) {
            logEntry.ts = Date.now();
            logEntry.logger_id = loggerId;
            LogEntryData.parse(logEntry);
            const result = await collections.logs?.insertOne(logEntry);
            SLogger.debug(`A log entry was inserted with id: ${result?.insertedId}`);
            res.status(201).json({
                logEntryId: result?.insertedId,
                message: 'Log entry created successfully.'
            });
        } else {
            res.status(404).json({message: `Logger not found with id: ${loggerId}`});
        }
    } catch(error) {
        //TODO add SLogger logs 
        if (error instanceof z.ZodError) {
            res.status(400).send(error.issues);
        } else if (error instanceof Error){
            res.status(500).send(error.message);
        } else {
            res.status(500).send({ message: 'Unhandled Exception'});
        }
    }
});

loggerRouter.post('/logger/start', async (req: Request, res: Response) => {
    try {
        createLogger(req, res);
    } catch(error) {
        res.status(500).send((error as Error).message);
    }
});

// PUT

// DELETE