import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { GameService } from '@app/services/game.service';
import { SessionInfo } from '@app/classes/session-info';
import { Constants } from '@app/constants';

@Service()
export class GameController {
    router: Router;

    constructor(private readonly gameService: GameService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         *
         * /game/end:
         *   remove:
         *     description: Ends a game
         *     produces:
         *       - application/json
         *
         */
        this.router.delete('/end/:id', async (req: Request, res: Response) => {
            const answer = await this.gameService.stopGame(req.params.id);
            res.json(answer);
            res.sendStatus(Constants.HTTP_STATUS.HTTP_STATUS_DELETED);
        });

        /**
         * @swagger
         *
         * /game/start:
         *   put:
         *     description: Starts a game
         *     produces:
         *       - application/json
         *
         */
        this.router.put('/start', async (req: Request, res: Response) => {
            try {
                const sessionInfo: SessionInfo = JSON.parse(req.body);
                const answer = await this.gameService.startGame(sessionInfo);
                res.json(answer);
                res.sendStatus(Constants.HTTP_STATUS.HTTP_STATUS_CREATED);
            } catch (e: unknown) {
                res.sendStatus(Constants.HTTP_STATUS.HTTP_STATUS_BAD_REQUEST);
            }
        });
    }
}
