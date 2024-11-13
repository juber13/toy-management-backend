// src/index.ts
import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import winston from "winston";
import connectDB from './config/connectDataBase.js';
import routes from './routes/index.js';
import moment from "moment-timezone";
import "winston-mongodb";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000');

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_BASE_URL
}));

connectDB();

export const logger = winston.createLogger({
    // Log only if level is less than (meaning more severe) or equal to this
    level: "info",
    // Use timestamp and printf to create a standard log format
    format: winston.format.combine(
        winston.format.timestamp({
            format: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
        }),
        winston.format.printf(
            (data) => `${data.timestamp} ${data.level}: ${data.message}`
        )
    ),
    // Log to the console and a file
    transports: [
        new winston.transports.Console(),
        // new winston.transports.File({ filename: "logs/app.log" }),
        new winston.transports.MongoDB({
            level: 'info', // You can choose the log level to store in MongoDB (e.g., 'error', 'warn', 'info')
            db: process.env.MONGO_URL, // MongoDB connection URI
            dbName: 'logsDB',
            collection: 'ss_logs', // The name of the collection where logs will be stored
            options: { useNewUrlParser: true, useUnifiedTopology: true },
            format: winston.format.combine(
                winston.format.timestamp({
                    format: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
                }),
                winston.format.json() // Store logs as JSON in MongoDB
            ),
        }),
    ],
});

app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = uuidv4();
    // Log an info message for each incoming request
    const requestBody = Object.keys(req.body).length ? JSON.stringify(req.body) : 'No body data';

    logger.info(`[Request ID: ${requestId}] Incoming Request:
        Method: ${req.method}
        URL: ${req.url}
        IP Address: ${req.ip}
        Body: ${requestBody}`);

    const originalSend = res.send;
    let responseBody: any;

    req.id = requestId;

    res.send = function (body) {
        responseBody = body;
        return originalSend.apply(this, arguments);
    };

    res.on('finish', () => {
        logger.info(`[Request ID: ${requestId}] Outgoing Response:
        Status Code: ${res.statusCode}
        Body: ${JSON.stringify(responseBody)}`);
    });

    next();
});

app.get('/health', (req: Request, res: Response) => {
    res.sendStatus(200);
});

app.use('/api', routes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(
        `[Request ID: ${req.id}] Error occurred during ${req.method} request to ${req.url} | Status: ${err.statusCode || 500} | Message: ${err.message || "No error message"} | Stack: ${err.stack || "No stack trace"}`
    );
    // if statusCode is there it means that message will also be created by me
    // if statusCode is not there it means that message is not created by me its something else in this situation we want to send internal server error.
    res.status(err.statusCode ? err.statusCode : 500).json({ error: err.statusCode ? err.message : 'Internal Server Error.Please try again later.' });
});

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

export default app;