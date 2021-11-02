import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { Constants } from '@app/constants';
import { Placement } from '@common';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { HumanPlayer } from '@app/classes/player/human-player/human-player';

@Service()
export class BoardController {
    router: Router;

    constructor(private sessionHandlingService: SessionHandlingService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/validate/:id', async (req: Request, res: Response) => {
            const boardHandler = this.getBoardHandler(req.params.id);
            const placement: Placement[] = req.body;

            if (boardHandler === null || placement === undefined) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const response = boardHandler.lookupLetters(boardHandler.retrieveNewLetters(placement));
            res.status(Constants.HTTP_STATUS.OK);
            res.json(response);
        });

        this.router.post('/place/:id', async (req: Request, res: Response) => {
            const humanPlayer = this.getHumanPlayer(req.params.id);
            const placements: Placement[] = req.body;

            if (humanPlayer === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const response = await humanPlayer.placeLetters(placements);
            res.status(Constants.HTTP_STATUS.OK);
            res.json(response);
        });

        this.router.get('/retrieve/:id', (req: Request, res: Response) => {
            const boardHandler = this.getBoardHandler(req.params.id);
            if (boardHandler === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const boardData = boardHandler.immutableBoard.boardData; // TODO
            res.status(Constants.HTTP_STATUS.OK);
            res.json(boardData);
        });
    }

    private getBoardHandler(id: string): BoardHandler | null {
        return this.sessionHandlingService.getHandlerByPlayerId(id)?.boardHandler ?? null;
    }

    private getHumanPlayer(id: string): HumanPlayer | null {
        const player = this.sessionHandlingService.getHandlerByPlayerId(id)?.players.find((p) => p.id === id) ?? null;

        if (player == null || !player.playerInfo.isHuman) {
            return null;
        }

        return player as HumanPlayer;
    }
}
