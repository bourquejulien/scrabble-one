import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { BoardHandlingService } from '@app/services/validation/board-handling.service';

@Service()
export class BoardController {
    router: Router;

    constructor(private readonly boardService: BoardHandlingService) {
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
        this.router.post('/place/:id', async (req: Request, res: Response) => {
            this.boardService.getBoardHandler('');
            // const answer = await this.gameService.stopGame(req.params.id);
            // res.json(answer);
            // res.sendStatus(HTTP_STATUS_DELETED);
        });

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
        this.router.post('/place/:id', async (req: Request, res: Response) => {
            // const answer = await this.gameService.stopGame(req.params.id);
            // res.json(answer);
            // res.sendStatus(Constants.HTTP_STATUS.);
        });

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
        this.router.get('/getBoard/:id', async (req: Request, res: Response) => {
            // const answer = await this.gameService.stopGame(req.params.id);
            // res.json(answer);
            // res.sendStatus(Constants.HTTP_STATUS.);
        });
    }
}
