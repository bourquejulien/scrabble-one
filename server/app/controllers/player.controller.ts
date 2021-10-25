import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { Constants } from '@app/constants';
import { PlayerType } from '@common';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { HumanPlayer } from '@app/classes/player/human-player/human-player';

@Service()
export class PlayerController {
    router: Router;

    constructor(private readonly sessionHandlingService: SessionHandlingService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/exchange/:id', async (req: Request, res: Response) => {
            const humanPlayer = this.getHumanPlayer(req.params.id);
            const exchange: string[] = JSON.parse(req.body);

            if (humanPlayer === null || exchange === undefined) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            humanPlayer.exchangeLetters(exchange);
            const response = humanPlayer.playerData;

            res.status(Constants.HTTP_STATUS.OK);
            res.json(response);
        });

        this.router.post('/skip/:id', async (req: Request, res: Response) => {
            const humanPlayer = this.getHumanPlayer(req.params.id);

            if (humanPlayer === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            humanPlayer.skipTurn();
            res.status(Constants.HTTP_STATUS.OK);
        });

        this.router.get('/playerData/:id', async (req: Request, res: Response) => {
            const humanPlayer = this.getHumanPlayer(req.params.id);
            if (humanPlayer === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            res.status(Constants.HTTP_STATUS.OK);
            res.json(humanPlayer.playerData);
        });
    }

    private getHumanPlayer(id: string): HumanPlayer | null {
        const player = this.sessionHandlingService.getHandler(id)?.players.find((p) => p.id === id) ?? null;

        if (player == null || player.playerInfo.playerType !== PlayerType.Human) {
            return null;
        }

        return player as HumanPlayer;
    }
}
