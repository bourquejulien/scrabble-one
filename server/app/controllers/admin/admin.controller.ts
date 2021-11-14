import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { Constants } from '@app/constants';
import { IncomingForm } from 'formidable';
import { tmpdir } from 'os';
import * as logger from 'winston';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';

const UPLOAD_DIR = tmpdir();
@Service()
export class AdminController {
    router: Router;

    constructor(private dictionaryService: DictionaryService, private sessionHandlingService: SessionHandlingService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/dictionary/upload', (req: Request, res: Response) => {
            const form = new IncomingForm({ multiples: false, uploadDir: UPLOAD_DIR });
            form.on('file', (formName, file) => {
                if (file.mimetype !== 'application/json') {
                    logger.error('Dictionary Upload Failed: non-JSON data received');
                    res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                    return;
                }
                logger.debug(`Dictionary downloaded : ${file.filepath}`);
                if (this.dictionaryService.parse(file.filepath)) {
                    res.sendStatus(Constants.HTTP_STATUS.OK);
                } else {
                    res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                }
            });
        });

        this.router.get('/dictionary', (req: Request, res: Response) => {
            res.json(this.dictionaryService.dictionaryMetadata);
        });

        this.router.get('/dictionary/:id', (req: Request, res: Response) => {
            const id = req.params.id;
            if (id) {
                const metadata = this.dictionaryService.getMetadata(id);
                if (metadata && metadata.filepath) {
                    logger.debug(`Requesting to download dictionary: ${metadata.filepath}`);
                    res.status(Constants.HTTP_STATUS.OK);
                    res.download(metadata.filepath);
                }
            }
        });

        this.router.delete('/dictionary/:id', (req: Request, res: Response) => {
            const id = req.params.id;
            if (id) {
                const metadata = this.dictionaryService.getMetadata(id);
                if (metadata && metadata.filepath) {
                    logger.debug(`Requesting to delete dictionary: ${metadata.filepath}`);
                    this.dictionaryService.remove(metadata);
                    res.status(Constants.HTTP_STATUS.OK);
                }
            }
        });

        this.router.get('/playername', (req: Request, res: Response) => {
            res.json(this.sessionHandlingService.virtualPlayerNames);
            logger.debug('Sent names');
        });

        this.router.patch('/playername', (req: Request, res: Response) => {
            console.log('', req.body);
            const json = JSON.parse(req.body);
            this.sessionHandlingService.virtualPlayerNames = json;
            res.sendStatus(Constants.HTTP_STATUS.OK);
        });

        this.router.get('/reset', (req: Request, res: Response) => {
            this.sessionHandlingService.virtualPlayerNames = this.sessionHandlingService.defaultBotNames;
            this.dictionaryService.reset();
            res.sendStatus(Constants.HTTP_STATUS.OK);
            logger.debug('Reset');
        });
    }
}
