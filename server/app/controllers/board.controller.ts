import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { BoardHandlingService } from '@app/services/validation/board-handling.service';
import { Constants } from '@app/constants';
import { Placement } from '@common';

@Service()
export class BoardController {
    router: Router;

    constructor(private readonly boardHandlingService: BoardHandlingService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         *
         * /game/end:
         *   post:
         *     description: Validate a placement
         *     produces:
         *       - application/json
         *
         */
        this.router.post('/validate/:id', async (req: Request, res: Response) => {
            const boardHandler = this.boardHandlingService.getBoardHandler(req.params.id);
            const placement: Placement[] = JSON.parse(req.body);

            if (boardHandler === null || placement === undefined) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const response = boardHandler.lookupLetters(placement);
            res.json(response);
            res.sendStatus(Constants.HTTP_STATUS.OK);
        });

        /**
         * @swagger
         *
         * /board/place:
         *   post:
         *     description: Try merging a placement
         *     produces:
         *       - application/json
         *
         */
        this.router.post('/place/:id', async (req: Request, res: Response) => {
            const boardHandler = this.boardHandlingService.getBoardHandler(req.params.id);
            const placement: Placement[] = JSON.parse(req.body);

            if (boardHandler === null || placement === undefined) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const response = boardHandler.placeLetters(placement);
            res.json(response);
            res.sendStatus(Constants.HTTP_STATUS.OK);
        });

        /**
         * @swagger
         *
         * /board/get:
         *   get:
         *     description: Retrieve game board data
         *     produces:
         *       - application/json
         *
         */
        this.router.get('/get/:id', async (req: Request, res: Response) => {
            const boardHandler = this.boardHandlingService.getBoardHandler(req.params.id);
            if (boardHandler === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const boardData = boardHandler.immutableBoard.boardData;
            res.json(boardData);
            res.sendStatus(Constants.HTTP_STATUS.OK);
        });
    }
}
