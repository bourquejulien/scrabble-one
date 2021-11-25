import 'reflect-metadata';
import * as logger from 'winston';

logger.configure({
    silent: true,
});

process.env.NODE_ENV = 'test';
process.env.DB_URL = 'test';
