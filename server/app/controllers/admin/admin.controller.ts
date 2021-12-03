import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { Constants } from '@app/constants';
import { IncomingForm } from 'formidable';
import { tmpdir } from 'os';
import * as logger from 'winston';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { DictionaryMetadata, GameMode, VirtualPlayerLevel } from '@common';
import { AdminPersistence } from '@app/services/admin/admin-persistence';
import { ScoreService } from '@app/services/score/score.service';

const UPLOAD_DIR = process.env.TEMP_DIR ?? tmpdir();

@Service()
export class AdminController {
    router: Router;

    constructor(private dictionaryService: DictionaryService, private adminService: AdminPersistence, private scoreService: ScoreService) {
        this.configureRouter();
    }

    private static getPlayerLevel(level: string): VirtualPlayerLevel | null {
        return VirtualPlayerLevel[level as keyof typeof GameMode];
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/dictionary/upload', async (req: Request, res: Response) => {
            const form = new IncomingForm({ multiples: false, uploadDir: UPLOAD_DIR });

            form.parse(req, (err: Error) => {
                if (err) {
                    logger.warn('Upload Error Caught', err);
                    return;
                }
            });

            form.on('file', async (formName, file) => {
                if (file.mimetype !== 'application/json') {
                    logger.warn('Dictionary Upload Failed: non-JSON data received');
                    res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                    return;
                }

                logger.debug(`Dictionary uploaded : ${file.filepath}`);

                try {
                    const answer = await this.dictionaryService.add(file.filepath);
                    res.json(answer);
                } catch (err) {
                    logger.warn('Error while adding dictionnary', err);
                    res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                }
            });
        });

        this.router.post('/dictionary/update', async (req: Request, res: Response) => {
            const metadataToUpdate: DictionaryMetadata[] = [];

            metadataToUpdate.push(...req.body);
            const answer = await this.dictionaryService.update(metadataToUpdate);

            logger.debug('Dictionary update ' + (answer.isSuccess ? 'succeeded' : 'failed'));
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

        this.router.get('/playername', async (req: Request, res: Response) => {
            const names = await this.adminService.getPlayerNames();
            res.json(names);
        });

        this.router.post('/playername/set/:level', async (req: Request, res: Response) => {
            const level = AdminController.getPlayerLevel(req.params.level);

            if (level == null || req.body.name === undefined) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const isAdded = await this.adminService.addVirtualPlayer(level, req.body.name);

            if (isAdded) {
                const names = await this.adminService.getPlayerNames();
                res.json(names);
                return;
            }
            res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
        });

        this.router.post('/playername/rename', async (req: Request, res: Response) => {
            const [oldName, newName] = req.body;

            const level = await this.adminService.renameVirtualPlayer(oldName, newName);

            if (level == null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const names = await this.adminService.getPlayerNames();
            res.json(names);
        });

        this.router.delete('/playername/:name', async (req: Request, res: Response) => {
            const level = await this.adminService.deleteVirtualPlayer(req.params.name);

            if (level == null) {
                res.sendStatus(Constants.HTTP_STATUS.BAD_REQUEST);
                return;
            }

            const names = await this.adminService.getPlayerNames();
            res.json(names);
        });

        this.router.get('/reset', async (req: Request, res: Response) => {
            const promises: Promise<void>[] = [];

            promises.push(this.dictionaryService.reset());
            promises.push(this.scoreService.reset());
            promises.push(this.adminService.reset());
            await Promise.all(promises);

            res.sendStatus(Constants.HTTP_STATUS.OK);
            logger.info('Persistent data reset');
        });
    }
}
