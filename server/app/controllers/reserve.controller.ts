import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
import { Constants } from '@app/constants';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';

@Service()
export class ReserveController {
    router: Router;

    constructor(private readonly sessionHandlingService: SessionHandlingService) {
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

            const reserveData = reserveHandler.reserve;
            res.status(Constants.HTTP_STATUS.OK);
            res.json(reserveData);
        });
    }

    private getReserveHandler(id: string): ReserveHandler | null {
        return this.sessionHandlingService.getHandlerByPlayerId(id)?.reserveHandler ?? null;
    }
}
