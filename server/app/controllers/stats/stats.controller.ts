import { StatsService } from '@app/services/stats/stats.service';
import { Score } from '@common';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

@Service()
export class StatsController {
    router: Router;

    constructor(private statsService: StatsService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/classic', async (req: Request, res: Response) => {
            const scores: Score[] = await this.statsService.getScoreboardClassic();
            res.json(scores);
        });

        this.router.get('/log', async (req: Request, res: Response) => {
            const scores: Score[] = await this.statsService.getScoreBoardLog();
            res.json(scores);
        });
    }
}
