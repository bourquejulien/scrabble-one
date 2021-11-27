import { Constants } from '@app/constants';
import { StatsService } from '@app/services/stats/stats.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import logger from 'winston';

@Service()
export class StatsController {
    router: Router;

    constructor(private statsService: StatsService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/classic', (req: Request, res: Response) => {
            this.statsService
                .scoreToDisplay(Constants.DATABASE_COLLECTION_CLASSIC)
                .then((scores) => res.json(scores))
                .catch((e) => {
                    logger.warn('', e);
                    res.sendStatus(Constants.HTTP_STATUS.NOT_FOUND);
                });
        });

        this.router.get('/log', (req: Request, res: Response) => {
            this.statsService
                .scoreToDisplay(Constants.DATABASE_COLLECTION_LOG)
                .then((scores) => res.json(scores))
                .catch((e) => {
                    logger.warn('', e);
                    res.sendStatus(Constants.HTTP_STATUS.NOT_FOUND);
                });
        });
    }
}
