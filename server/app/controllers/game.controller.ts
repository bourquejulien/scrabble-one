import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { GameService } from '@app/services/game/game.service';
import { Constants } from '@app/constants';

@Service()
export class GameController {
    router: Router;

    constructor(private readonly gameService: GameService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.put('/init/single', async (req: Request, res: Response) => {
            try {
                const answer = await this.gameService.initSinglePlayer(req.body);
                res.json(answer);
            } catch (e: unknown) {
                res.status(Constants.HTTP_STATUS.BAD_REQUEST);
            }
        });

        this.router.put('/init/multi', async (req: Request, res: Response) => {
            try {
                const answer = await this.gameService.initMultiplayer(req.body);
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

        this.router.put('/convert', async (req: Request, res: Response) => {
            const answer = await this.gameService.convert(req.body);

            if (answer == null) {
                res.status(Constants.HTTP_STATUS.BAD_REQUEST);
            }

            res.json(answer);
        });
    }
}
