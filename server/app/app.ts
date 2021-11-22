import { HttpException } from '@app/classes/http.exception';
import { GameController } from '@app/controllers/game/game.controller';
import { ReserveController } from '@app/controllers/reserve/reserve.controller';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import morgan from 'morgan';
import { Service } from 'typedi';
import { AdminController } from './controllers/admin/admin.controller';
import { PlayerController } from './controllers/player/player.controller';
import * as logger from 'winston';

@Service()
export class Application {
    app: express.Application;
    private readonly internalError: number;

    constructor(
        private readonly gameController: GameController,
        private readonly playerController: PlayerController,
        private readonly reserveController: ReserveController,
        private readonly adminController: AdminController,
    ) {
        this.internalError = StatusCodes.INTERNAL_SERVER_ERROR;
        this.app = express();
        this.validateEnv();
        this.config();
        this.bindRoutes();
    }

    private bindRoutes(): void {
        this.app.use('/api/game', this.gameController.router);
        this.app.use('/api/player', this.playerController.router);
        this.app.use('/api/reserve', this.reserveController.router);
        this.app.use('/api/admin', this.adminController.router);
        this.errorHandling();
    }

    private validateEnv(): void {
        const REQUIRED_ENV_VARIABLES = ['DB_HOST', 'DB_USER', 'DB_PASSWORD'];

        for (const envVariable of REQUIRED_ENV_VARIABLES) {
            if (!(envVariable in process.env)) {
                logger.error(`Error: ${envVariable} environment variable not set`);
                process.exit(1);
            }
        }
    }

    private config(): void {
        // Middlewares configuration
        if (process.env.NODE_ENV !== 'test') {
            this.app.use(morgan('dev'));
        }
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: HttpException = new HttpException(`Path: (${req.path}) - Not Found`);
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user (in production env only)
        this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
