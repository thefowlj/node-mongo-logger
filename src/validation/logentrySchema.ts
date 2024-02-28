import { z } from 'zod';
import { ObjectId } from "bson";

const LogEntryData = z.object({
    message: z.string(),
    logger_id: z.instanceof(ObjectId)
});

export default LogEntryData;