import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { Constants } from '@app/constants';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { HumanPlayer } from '@app/classes/player/human-player/human-player';
import { VirtualPlayer } from '@app/classes/player/virtual-player/virtual-player';

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
            const exchange: string[] = req.body;

            if (humanPlayer === null || exchange === undefined) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const response = humanPlayer.exchangeLetters(exchange);

            res.status(Constants.HTTP_STATUS.OK);
            res.json(response);
        });

        this.router.post('/skip/:id', async (req: Request, res: Response) => {
            const humanPlayer = this.getHumanPlayer(req.params.id);

            if (humanPlayer === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const response = humanPlayer.skipTurn();

            res.status(Constants.HTTP_STATUS.OK);
            res.json(response);
        });

        this.router.get('/retrieve/:id', async (req: Request, res: Response) => {
            const humanPlayer = this.getHumanPlayer(req.params.id);
            if (humanPlayer === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            res.status(Constants.HTTP_STATUS.OK);
            res.json(humanPlayer.playerData);
        });

        // TODO To remove once server is master over client
        this.router.post('/virtual', async (req: Request, res: Response) => {
            const virtualPlayer = this.getVirtualPlayer(req.body.id);

            if (virtualPlayer === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            await virtualPlayer.startTurn();
            const response = virtualPlayer.playerData;

            res.status(Constants.HTTP_STATUS.OK);
            res.json(response);
        });
    }

    private getHumanPlayer(id: string): HumanPlayer | null {
        const player = this.sessionHandlingService.getHandler(id)?.players.find((p) => p.id === id) ?? null;

        if (player == null || !player.playerInfo.isHuman) {
            return null;
        }

        return player as HumanPlayer;
    }

    private getVirtualPlayer(id: string): VirtualPlayer | null {
        const player = this.sessionHandlingService.getHandler(id)?.players.find((p) => p.id !== id) ?? null;

        if (player == null || player.playerInfo.isHuman) {
            return null;
        }

        return player as VirtualPlayer;
    }
}
