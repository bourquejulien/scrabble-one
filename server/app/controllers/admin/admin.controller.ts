import { Service } from 'typedi';
// import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { Request, Response, Router } from 'express';
import { Constants } from '@app/constants';
import { Fields, Files, IncomingForm } from 'formidable';
import * as logger from 'winston';

@Service()
export class AdminController {
    router: Router;

    constructor() {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/dictionary/upload', (req: Request, res: Response) => {
            const form = new IncomingForm();
            form.parse(req, (err: Error, fields: Fields, files: Files) => {
                if (err) {
                    return;
                }
                console.log("", fields, files);
            });
            form.on('file', () => {
                logger.info('Got filename');
            });
            res.sendStatus(Constants.HTTP_STATUS.OK);
        });
    }
}
