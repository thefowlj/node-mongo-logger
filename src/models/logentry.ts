// External dependencies
import { ObjectId } from "mongodb";

// Class Implementation
export default class LogEntry {
    constructor(
        public message: string, 
        public ts: number, 
        public logger_id: ObjectId, 
        public id?: ObjectId) {}
}