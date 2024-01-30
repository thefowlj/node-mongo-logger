import express, {Express, Request, Response} from 'express';
import { connectToDatabase } from "./services/database.service"
import { loggerRouter } from "./routes/logger.router";
import SLogger from "./lib/logger";

const app: Express = express();
const port = 3000;

connectToDatabase()
    .then(() => {
        app.use(loggerRouter);

        app.listen(port, () => {
            SLogger.debug(`Server started at http://localhost:${port}`)
        });
    })
    .catch((error: Error) => {
        SLogger.error("Database connection failed", error);
        process.exit();
    });