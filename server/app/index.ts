// WARNING : Make sure to always import 'reflect-metadata' and 'module-alias/register' first

import 'module-alias/register';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { Container } from 'typedi';
import winston, * as logger from 'winston';
import { Server } from './server';

dotenv.config();

const logFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
    let format = `${timestamp} - ${level} - ${message}`;
    if (stack !== undefined) {
        format += ` - ${stack}`;
    }
    return format;
});

logger.configure({
    level: 'debug',
    transports: [
        new logger.transports.Console({
            format: winston.format.combine(
                winston.format.errors({ stack: true }),
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.timestamp({ format: 'HH:mm:ss' }),
                logFormat,
            ),
            handleExceptions: true,
        }),
    ],
    exitOnError: false,
});

process.on('unhandledRejection', (reason: Error) => {
    throw reason;
});

const server: Server = Container.get(Server);
server.init();
