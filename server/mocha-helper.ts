import 'reflect-metadata';
import * as logger from 'winston';

logger.configure({
    silent: true,
});

process.env.DB_HOST = 'testHost';
process.env.DB_USER = 'testUsr';
process.env.DB_PASSWORD = 'testPsswd';
