import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { Constants } from '@app/constants';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';

@Service()
export class ReserveController {
    router: Router;

    constructor(private sessionHandlingService: SessionHandlingService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/retrieve/:id', async (req: Request, res: Response) => {
            const reserveHandler = this.getReserveHandler(req.params.id);
            if (reserveHandler === null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            res.json(reserveHandler.reserve);
        });
    }

    private getReserveHandler(id: string): ReserveHandler | null {
        return this.sessionHandlingService.getHandlerByPlayerId(id)?.reserveHandler ?? null;
    }
}
