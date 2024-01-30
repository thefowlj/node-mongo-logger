// External dependencies
import { ObjectId } from "mongodb";

// Class Implementation
export default class Logger {
    constructor(
        public createdTs: number,
        public name?: string, 
        public _id?: ObjectId) {}
}