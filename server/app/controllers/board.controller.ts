import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { Constants } from '@app/constants';
import { Placement } from '@common';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';

@Service()
export class BoardController {
    router: Router;

    constructor(private readonly sessionHandlingService: SessionHandlingService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/validate/:id', async (req: Request, res: Response) => {
            const boardHandler = this.getBoardHandler(req.params.id);
            const placement: Placement[] = JSON.parse(req.body);

            if (boardHandler === null || placement === undefined) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const response = boardHandler.lookupLetters(boardHandler.retrieveNewLetters(placement));
            res.status(Constants.HTTP_STATUS.OK);
            res.json(response);
        });

        this.router.post('/place/:id', async (req: Request, res: Response) => {
            const boardHandler = this.getBoardHandler(req.params.id);
            const placement: Placement[] = JSON.parse(req.body);

            if (boardHandler === null || placement === undefined) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const response = boardHandler.placeLetters(boardHandler.retrieveNewLetters(placement));
            res.status(Constants.HTTP_STATUS.OK);
            res.json(response);
        });

        this.router.get('/retrieve/:id', async (req: Request, res: Response) => {
            const boardHandler = this.getBoardHandler(req.params.id);
            if (boardHandler === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const boardData = boardHandler.immutableBoard.boardData;
            res.status(Constants.HTTP_STATUS.OK);
            res.json(boardData);
        });
    }

    private getBoardHandler(id: string): BoardHandler | null {
        return this.sessionHandlingService.getHandler(id)?.boardHandler ?? null;
    }
}
