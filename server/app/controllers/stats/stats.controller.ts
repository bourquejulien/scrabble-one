import { Constants } from '@app/constants';
import { StatsService } from "@app/services/stats/stats.service";
import { Response, Router } from 'express';
import { Service } from "typedi";
@Service()
export class StatsController {
    router: Router;

    constructor(private statsService: StatsService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/classic', async (res: Response) => {
            const scoreboard = await this.statsService.getScoreboardClassic();

            if (scoreboard === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
            }

            this.statsService
                .getScoreboardClassic()
                .then((stats) => {
                    res.json(stats);
                })
        });


        this.router.get('/log', async (res: Response) => {
            const scoreboard = await this.statsService.getScoreBoardLog();

            if (scoreboard === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
            }

            this.statsService
                .getScoreBoardLog()
                .then((stats) => {
                    res.json(stats);
                })
        });
    }
}

/**
 *         this.router.put('/score/classic', async (res: Response) => {
            this.statsService
                .getScoreboardClassic()
                .then((stats) => {
                    res.json(stats);
                })
                .catch(() => {
                    res.sendStatus(Constants.HTTP_STATUS.NOT_FOUND);
                });
        });

 */
