import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { Constants } from '@app/constants';
import { SessionHandlingService } from '@app/services/session-handling/session-handling.service';
import { HumanPlayer } from '@app/classes/player/human-player/human-player';
import { Placement } from '@common';

@Service()
export class PlayerController {
    router: Router;

    constructor(private sessionHandlingService: SessionHandlingService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/place/:id', async (req: Request, res: Response) => {
            const humanPlayer = this.getHumanPlayer(req.params.id);
            const placements: Placement[] = req.body;

            if (humanPlayer === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const response = await humanPlayer.placeLetters(placements);
            res.json(response);
        });

        this.router.post('/exchange/:id', async (req: Request, res: Response) => {
            const humanPlayer = this.getHumanPlayer(req.params.id);
            const exchange: string[] = req.body;

            if (humanPlayer === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const response = humanPlayer.exchangeLetters(exchange);
            res.json(response);
        });

        this.router.post('/skip/:id', async (req: Request, res: Response) => {
            const humanPlayer = this.getHumanPlayer(req.params.id);

            if (humanPlayer === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const response = humanPlayer.skipTurn();
            res.json(response);
        });
    }

    private getHumanPlayer(id: string): HumanPlayer | null {
        const player = this.sessionHandlingService.getHandlerByPlayerId(id)?.players.find((p) => p.id === id) ?? null;

        if (player == null || !player.playerInfo.isHuman) {
            return null;
        }

        return player as HumanPlayer;
    }
}
