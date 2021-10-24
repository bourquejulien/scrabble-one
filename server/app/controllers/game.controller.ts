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

        /**
         * @swagger
         * tags:
         *   - name: Game
         *     description: Game functions
         */

        /**
         * @swagger
         *
         * definitions:
         *   Answer:
         *     type: object
         *     properties:
         *       isSuccess:
         *         type: boolean
         *       body:
         *         type: string
         */

        /**
         * @swagger
         *
         * definitions:
         *   PlayerInfo:
         *     type: object
         *     properties:
         *       name:
         *         type: string
         *       isVirtual:
         *         type: boolean
         */

        /**
         * @swagger
         *
         * definitions:
         *   ArrayOfPlayerInfo:
         *     type: array
         *     items:
         *       $ref: '#/definitions/PlayerInfo'
         */

        /**
         * @swagger
         *
         * definitions:
         *   SessionInfo:
         *     type: object
         *     properties:
         *       playerInfo:
         *         $ref: '#/definitions/ArrayOfPlayerInfo'
         */

        /**
         * @swagger
         *
         * /api/game/end:
         *   delete:
         *     description: End a game
         *     tags:
         *       - Game
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
         *       204:
         *         schema:
         *           $ref: '#/definitions/Answer'
         */
        this.router.delete('/end/:id', async (req: Request, res: Response) => {
            const answer = await this.gameService.stopGame(req.params.id);
            res.status(answer.isSuccess ? Constants.HTTP_STATUS.DELETED : Constants.HTTP_STATUS.BAD_REQUEST);
            res.json(answer);
        });

        /**
         * @swagger
         *
         * /api/game/start:
         *   put:
         *     description: Starts a game
         *     tags:
         *       - Game
         *     requestBody:
         *         description: SessionInfo object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/definitions/SessionInfo'
         *     produces:
         *       - application/json
         *     responses:
         *       201:
         *         schema:
         *           $ref: '#/definitions/Answer'
         *
         */
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
