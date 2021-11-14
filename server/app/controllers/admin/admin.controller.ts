import { Service } from 'typedi';
// import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { Request, Response, Router } from 'express';
import { Constants } from '@app/constants';
import { Fields, Files, IncomingForm } from 'formidable';
import { tmpdir } from 'os';
import * as logger from 'winston';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';

const UPLOAD_DIR = tmpdir();
@Service()
export class AdminController {
    router: Router;

    constructor(private dictionaryService: DictionaryService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/dictionary/upload', (req: Request, res: Response) => {
            const form = new IncomingForm({ multiples: false, uploadDir: UPLOAD_DIR });
            form.parse(req, (err: Error, fields: Fields, files: Files) => {
                if (err) {
                    logger.error(`Upload Error Caught - ${err}`);
                    res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                    return;
                }
                res.sendStatus(Constants.HTTP_STATUS.OK);
            });
            form.on('file', (formName, file) => {
                if (file.mimetype !== 'application/json') {
                    logger.error('Dictionary Upload Failed: non-JSON data received');
                }
                // TODO: parse JSON, creat metadata, add to service
                console.log('', file.filepath);
            });
        });

        this.router.get('/dictionary', (req: Request, res: Response) => {
            res.json(this.dictionaryService.dictionaryMetadata);
        });

        this.router.get('/dictionary/:id', (req: Request, res: Response) => {
            const id = req.params.id;
            if (id) {
                const metadata = this.dictionaryService.get(id);
                if (metadata && metadata.filepath) {
                    logger.debug(`Requesting to download dictionary: ${metadata.filepath}`);
                    res.status(Constants.HTTP_STATUS.OK);
                    res.download(metadata.filepath);
                }
            }
            // res.sendStatus(Constants.HTTP_STATUS.NOT_FOUND);
        });

        this.router.get('/playername', (req: Request, res: Response) => {
            res.json();
        });
    }
}
