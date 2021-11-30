import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { Constants } from '@app/constants';
import { IncomingForm } from 'formidable';
import { tmpdir } from 'os';
import * as logger from 'winston';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { Answer, DictionaryMetadata } from '@common';

interface Playernames {
    experts: string[];
    beginners: string[];
}

const UPLOAD_DIR = process.env.TEMP_DIR ?? tmpdir();

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

        this.router.post('/dictionary/upload', async (req: Request, res: Response) => {
            const form = new IncomingForm({ multiples: false, uploadDir: UPLOAD_DIR });

            // form.parse(req, async (err: Error) => {
            //     if (err) {
            //         logger.error('Upload Error Caught', err);
            //         return;
            //     }
            // });

            form.on('file', async (formName, file) => {
                if (file.mimetype !== 'application/json') {
                    logger.error('Dictionary Upload Failed: non-JSON data received');
                    res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                    return;
                }

                logger.debug(`Dictionary uploaded : ${file.filepath}`);

                try {
                    await this.dictionaryService.add(file.filepath);

                    res.sendStatus(Constants.HTTP_STATUS.OK);
                } catch (err) {
                    logger.error('Dictionary parsing error', err);
                }
            });
        });

        this.router.post('/dictionary/update', async (req: Request, res: Response) => {
            const metadataToUpdate: DictionaryMetadata[] = [];

            metadataToUpdate.push(...req.body);
            const isSuccess = await this.dictionaryService.update(metadataToUpdate);

            let names = ' ';
            const metadata = await this.dictionaryService.getMetadata();
            metadata.forEach((e) => (names = '«' + e.title + '» '));

            logger.debug(`Updated dictionary: ${names}`);

            const answer: Answer<DictionaryMetadata[]> = { isSuccess, payload: metadata };
            res.json(answer);
        });

        this.router.get('/dictionary', async (req: Request, res: Response) => {
            const metadata = await this.dictionaryService.getMetadata();
            res.json(metadata);
        });

        this.router.get('/dictionary/:id', async (req: Request, res: Response) => {
            const id = req.params.id;
            logger.debug(`Requesting to download dictionary: ${id}`);

            if (id) {
                const dictionary = await this.dictionaryService.getJsonDictionary(id);

                if (dictionary != null) {
                    res.status(Constants.HTTP_STATUS.OK);
                    res.json(dictionary);
                }
            }
        });

        this.router.delete('/dictionary/:id', async (req: Request, res: Response) => {
            const isSuccess = await this.dictionaryService.remove(req.params.id);
            res.sendStatus(isSuccess ? Constants.HTTP_STATUS.DELETED : Constants.HTTP_STATUS.BAD_REQUEST);
        });

        this.router.get('/playername', (req: Request, res: Response) => {
            res.json(this.virtualPlayerNames);
        });

        this.router.post('/playername', (req: Request, res: Response) => {
            this.virtualPlayerNames = req.body;
            logger.debug('Virtual Player Names - length:' + this.virtualPlayerNames.experts.length + this.virtualPlayerNames.beginners.length);
            res.sendStatus(Constants.HTTP_STATUS.OK);
        });

        this.router.get('/reset', async (req: Request, res: Response) => {
            this.virtualPlayerNames = this.defaultBotNames;
            await this.dictionaryService.reset();
            res.sendStatus(Constants.HTTP_STATUS.OK);
            logger.debug('Reset');
        });
    }
}
