import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { Constants } from '@app/constants';
import { IncomingForm } from 'formidable';
import { tmpdir } from 'os';
import * as logger from 'winston';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
interface Playernames {
    experts: string[];
    beginners: string[];
}
const UPLOAD_DIR = /* process.env.UPLOAD_DIR ?? */ tmpdir();
@Service()
export class AdminController {
    readonly defaultBotNames: Playernames = {
        beginners: ['Monique', 'Claudette', 'Alphonse'],
        experts: ['Éléanor', 'Alfred', 'Jeaninne'],
    };
    virtualPlayerNames: Playernames;
    router: Router;

    constructor(private dictionaryService: DictionaryService) {
        this.virtualPlayerNames = this.defaultBotNames;
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/dictionary/upload', (req: Request, res: Response) => {
            const form = new IncomingForm({ multiples: false, uploadDir: UPLOAD_DIR });
            form.parse(req, (err: Error) => {
                if (err) {
                    logger.error(`Upload Error Caught - ${err}`);
                    return;
                }
            });
            form.on('file', async (formName, file) => {
                if (file.mimetype !== 'application/json') {
                    logger.error('Dictionary Upload Failed: non-JSON data received');
                    res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                    return;
                }
                logger.debug(`Dictionary uploaded : ${file.filepath}`);
                if (await this.dictionaryService.parse(file.filepath)) {
                    logger.debug(`Dictionary parsed : ${file.filepath}`);
                    res.sendStatus(Constants.HTTP_STATUS.OK);
                } else {
                    res.json({ erreur: 'Format du dictionnaire invalide' });
                    res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                }
            });
        });

        this.router.get('/dictionary', (req: Request, res: Response) => {
            res.json(this.dictionaryService.dictionaries);
        });

        this.router.post('/dictionary', (req: Request, res: Response) => {
            this.dictionaryService.update(req.body);
            let names = ' ';
            this.dictionaryService.dictionaries.forEach((e) => (names = '«' + e.title + '» '));
            logger.debug(`Updated dictionary: ${names}`);
            res.sendStatus(Constants.HTTP_STATUS.OK);
        });

        this.router.get('/dictionary/:id', (req: Request, res: Response) => {
            const id = req.params.id;
            if (id) {
                const metadata = this.dictionaryService.getMetadata(id);
                if (metadata) {
                    const filepath = this.dictionaryService.getFilepath(metadata);
                    logger.debug(`Requesting to download dictionary: ${filepath}`);
                    res.status(Constants.HTTP_STATUS.OK);
                    res.download(filepath);
                }
            }
        });

        this.router.get('/playername', (req: Request, res: Response) => {
            res.json(this.virtualPlayerNames);
        });

        this.router.post('/playername', (req: Request, res: Response) => {
            this.virtualPlayerNames = req.body;
            logger.debug('Virtual Player Names - length:' + this.virtualPlayerNames.experts.length + this.virtualPlayerNames.beginners.length);
            res.sendStatus(Constants.HTTP_STATUS.OK);
        });

        this.router.get('/reset', (req: Request, res: Response) => {
            this.virtualPlayerNames = this.defaultBotNames;
            this.dictionaryService.reset();
            res.sendStatus(Constants.HTTP_STATUS.OK);
            logger.debug('Reset');
        });
    }
}
