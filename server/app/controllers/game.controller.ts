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

        this.router.put('/start/single', async (req: Request, res: Response) => {
            try {
                const answer = await this.gameService.startSinglePlayer(req.body);
                res.json(answer);
            } catch (e: unknown) {
                res.status(Constants.HTTP_STATUS.BAD_REQUEST);
            }
        });

        this.router.put('/start/multi', async (req: Request, res: Response) => {
            try {
                const answer = await this.gameService.startMultiplayer(req.body);
                res.json(answer);
            } catch (e: unknown) {
                res.status(Constants.HTTP_STATUS.BAD_REQUEST);
            }
        });

        this.router.put('/join', async (req: Request, res: Response) => {
            try {
                const answer = await this.gameService.joinMultiplayer(req.body);

                if (answer == null) {
                    res.status(Constants.HTTP_STATUS.NOT_FOUND);
                }

                res.json(answer);
            } catch (e: unknown) {
                res.status(Constants.HTTP_STATUS.BAD_REQUEST);
            }
        });
    }
}
