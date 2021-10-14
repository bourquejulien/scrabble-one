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
         * tags:
         *   - name: Board
         *     description: Board functions
         */

        /**
         * @swagger
         *
         * definitions:
         *   ValidationResponse:
         *     type: object
         *     properties:
         *       isSuccess:
         *         type: boolean
         *       points:
         *         type: integer
         *       description:
         *         type: string
         */

        /**
         * @swagger
         *
         * definitions:
         *   Vec2:
         *     type: object
         *     properties:
         *       x:
         *         type: integer
         *       y:
         *         type: integer
         */

        /**
         * @swagger
         *
         * definitions:
         *   Placement:
         *     type: object
         *     properties:
         *       letter:
         *         type: string
         *       position:
         *         $ref: '#/definitions/Vec2'
         */

        /**
         * @swagger
         *
         * definitions:
         *   ArrayOfPlacement:
         *     type: array
         *     items:
         *       $ref: '#/definitions/Placement'
         */

        /**
         * @swagger
         *
         * /api/board/validate:
         *   post:
         *     description: Validate a placement
         *     tags:
         *       - Board
         *     requestBody:
         *         description: message object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/definitions/ArrayOfPlacement'
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *         description: Game ID
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/ValidationResponse'
         *
         */
        this.router.post('/validate/:id:isFullWord', async (req: Request, res: Response) => {
            const boardHandler = this.boardHandlingService.getBoardHandler(req.params.id);
            const placement: Placement[] = JSON.parse(req.body);

            if (boardHandler === null || placement === undefined) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const response = boardHandler.lookupLetters(placement);
            res.status(Constants.HTTP_STATUS.OK);
            res.json(response);
        });

        /**
         * @swagger
         *
         * /api/board/place:
         *   post:
         *     description: Try merging a placement
         *     tags:
         *       - Board
         *     requestBody:
         *         description: message object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/definitions/ArrayOfPlacement'
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *         description: Game ID
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/ValidationResponse'
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
            res.status(Constants.HTTP_STATUS.OK);
            res.json(response);
        });

        /**
         * @swagger
         *
         * /api/board/retrieve/{id}:
         *   get:
         *     description: Retrieve game board data
         *     tags:
         *       - Board
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *         description: Game ID
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/BoardData' //TODO
         *
         */
        this.router.get('/retrieve/:id', async (req: Request, res: Response) => {
            const boardHandler = this.boardHandlingService.getBoardHandler(req.params.id);
            if (boardHandler === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const boardData = boardHandler.immutableBoard.boardData;
            res.status(Constants.HTTP_STATUS.OK);
            res.json(boardData);
        });
    }
}
