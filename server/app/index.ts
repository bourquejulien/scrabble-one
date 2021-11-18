// WARNING : Make sure to always import 'reflect-metadata' and 'module-alias/register' first

import dotenv from 'dotenv';
import 'module-alias/register';
import 'reflect-metadata';
import { Container } from 'typedi';
import winston, * as logger from 'winston';
import { Server } from './server';

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} - ${level} - ${message}`;
});

logger.configure({
    level: 'debug',
    transports: [
        new logger.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.timestamp({ format: 'HH:mm:ss' }),
                logFormat,
            ),
            silent: process.env.NODE_ENV === 'test',
        }),
    ],
});

dotenv.config();
const server: Server = Container.get(Server);
server.init();
