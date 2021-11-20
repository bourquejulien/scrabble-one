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

    private configureRouter() {
        this.router = Router();

        this.router.put('/score/classic', async (res: Response) => {
            this.statsService
                .getScoreboardClassic()
                .then((stats) => {
                    res.json(stats);
                })
                .catch(() => {
                    res.sendStatus(Constants.HTTP_STATUS.NOT_FOUND);
                });
        });

        this.router.put('/score/log', async (res: Response) => {
            this.statsService
                .getScoreBoardLog()
                .then((stats) => {
                    res.json(stats);
                })
                .catch(() => {
                    res.sendStatus(Constants.HTTP_STATUS.NOT_FOUND);
                });
        });
    }
}
