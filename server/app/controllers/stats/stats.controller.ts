import { StatsService } from '@app/services/stats/stats.service';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { Constants } from '@app/constants';
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
                .getScoreboardClassic()
                .then((scores) => res.json(scores))
                .catch((e) => {
                    logger.warn('', e);
                    res.sendStatus(Constants.HTTP_STATUS.NOT_FOUND);
                });
        });

        this.router.get('/log', (req: Request, res: Response) => {
            this.statsService
                .getScoreBoardLog()
                .then((scores) => res.json(scores))
                .catch((e) => {
                    logger.warn('', e);
                    res.sendStatus(Constants.HTTP_STATUS.NOT_FOUND);
                });
        });
    }
}
