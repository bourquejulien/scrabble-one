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
            const config = await this.gameService.initSinglePlayer(req.body);

            if (config == null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }
            res.json(config);
        });

        this.router.put('/init/multi', async (req: Request, res: Response) => {
            const config = await this.gameService.initMultiplayer(req.body);

            if (config == null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            res.json(config);
        });

        this.router.put('/join', async (req: Request, res: Response) => {
            const config = await this.gameService.joinMultiplayer(req.body);

            if (config == null) {
                res.sendStatus(Constants.HTTP_STATUS.NOT_FOUND);
                return;
            }

            res.json(config);
        });

        this.router.put('/convert', async (req: Request, res: Response) => {
            const config = await this.gameService.convert(req.body);

            if (config == null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }
            res.json(config);
        });
    }
}
