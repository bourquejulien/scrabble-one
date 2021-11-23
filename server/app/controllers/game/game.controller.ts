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
            this.gameService
                .initSinglePlayer(req.body)
                .then((config) => {
                    res.json(config);
                })
                .catch(() => {
                    res.sendStatus(Constants.HTTP_STATUS.NOT_FOUND);
                });
        });

        this.router.put('/init/multi', async (req: Request, res: Response) => {
            this.gameService
                .initMultiplayer(req.body)
                .then((config) => {
                    res.json(config);
                })
                .catch(() => {
                    res.sendStatus(Constants.HTTP_STATUS.NOT_FOUND);
                });
        });

        this.router.put('/join', async (req: Request, res: Response) => {
            this.gameService
                .joinMultiplayer(req.body)
                .then((config) => {
                    res.json(config);
                })
                .catch(() => {
                    res.sendStatus(Constants.HTTP_STATUS.NOT_FOUND);
                });
        });

        this.router.put('/convert', async (req: Request, res: Response) => {
            this.gameService
                .convert(req.body)
                .then((config) => {
                    res.json(config);
                })
                .catch(() => {
                    res.sendStatus(Constants.HTTP_STATUS.NOT_FOUND);
                });
        });
    }
}
