"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const init_1 = require("./db/init");
const port = Number(process.env.PORT) || 5174;
const startServer = async () => {
    app_1.default.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
    try {
        await (0, init_1.initializeDatabase)();
        console.log('Database initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize database. The API will keep running, but database-backed routes may fail until this is fixed.', error);
    }
};
startServer();
