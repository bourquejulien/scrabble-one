import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { GameService } from '@app/services/game.service';
import { Constants } from '@app/constants';

@Service()
export class GameController {
    router: Router;

    constructor(private readonly gameService: GameService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.delete('/end/:id', async (req: Request, res: Response) => {
            const answer = await this.gameService.stopGame(req.params.id);
            res.status(answer.isSuccess ? Constants.HTTP_STATUS.DELETED : Constants.HTTP_STATUS.BAD_REQUEST);
            res.json(answer);
        });

        this.router.put('/start', async (req: Request, res: Response) => {
            try {
                const answer = await this.gameService.startVirtualGame(req.body);
                res.json(answer);
            } catch (e: unknown) {
                res.status(Constants.HTTP_STATUS.BAD_REQUEST);
            }
        });
    }
}
