// External Dependencies
import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";
import path from "path";
import SLogger from "../lib/logger";


// Global Variables
export const collections: { 
    loggers?: mongoDB.Collection, 
    logs?: mongoDB.Collection
} = {};

// Initialize Connection
export async function connectToDatabase() {
    dotenv.config({ path: path.resolve(__dirname, "../../.env" )});
    console.log(path.resolve(__dirname, "../.env" ));
    console.log(process.env.DB_CONN_STRING);
    const client: mongoDB.MongoClient = new mongoDB.MongoClient((process.env.DB_CONN_STRING as string));
    await client.connect();
    const db: mongoDB.Db = client.db(process.env.DB_NAME);
    const loggersCollection: mongoDB.Collection = db.collection((process.env.LOGGER_COLLECTION_NAME as string));
    const logsCollection: mongoDB.Collection = db.collection((process.env.LOGS_COLLECTION_NAME as string));
    collections.loggers = loggersCollection;
    collections.logs = logsCollection;
    SLogger.info(`Successfully connected to database: ${db.databaseName}`);
}