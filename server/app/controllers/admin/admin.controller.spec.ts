/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { Constants } from '@app/constants';
import { expect } from 'chai';
import { stub, createStubInstance, SinonStubbedInstance, SinonStub } from 'sinon';
import request from 'supertest';
import { Container } from 'typedi';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { IncomingForm, File } from 'formidable';
import { DictionaryMetadata, JsonDictionary, VirtualPlayerLevel, VirtualPlayerName } from '@common';
import { AdminPersistence } from '@app/services/admin/admin-persistence';
const metadata: DictionaryMetadata = {
    _id: 'dictionary.json',
    path: 'dictionary.json',
    description: 'dictionary for tests',
    nbWords: 1024,
    title: 'Grand Dictionary of Tests',
};
const jsonDictionary: JsonDictionary = {
    words: ['alpha', 'beta', 'gamma'],
    title: 'Dictionnaire',
    description: 'Description',
};

describe('AdminController', () => {
    let expressApp: Express.Application;
    let dictionaryServiceStub: SinonStubbedInstance<DictionaryService>;
    let adminServiceStub: SinonStubbedInstance<AdminPersistence>;
    let file: File;
    let incomingFormStub: SinonStub;
    // let scoreServiceStub: SinonStubbedInstance<ScoreService>;
    beforeEach(async () => {
        dictionaryServiceStub = createStubInstance(DictionaryService);
        adminServiceStub = createStubInstance(AdminPersistence);
        // scoreServiceStub = createStubInstance(ScoreService);
        dictionaryServiceStub.getMetadataById.resolves(metadata);
        file = createStubInstance(File) as unknown as File;
        file.mimetype = 'application/json';
        incomingFormStub = stub(IncomingForm.prototype, 'on').callsFake((name: string, callback: (filename: string, file: File) => void) => {
            if (name === 'file') {
                callback('filename', file);
            }
        });
        const app = Container.get(Application);
        Object.defineProperty(app['adminController'], 'dictionaryService', { value: dictionaryServiceStub });
        Object.defineProperty(app['adminController'], 'adminService', { value: adminServiceStub });
        expressApp = app.app;
    });
    afterEach(() => {
        incomingFormStub.restore();
    });
    it('GET /dictionary/ ', async () => {
        return request(expressApp)
            .get('/api/admin/dictionary/')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });
    it('GET /dictionary/ with id ', async () => {
        dictionaryServiceStub.getJsonDictionary.resolves(jsonDictionary);
        return request(expressApp)
            .get('/api/admin/dictionary/123')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });
    it('DELETE /dictionary/ with id ', async () => {
        dictionaryServiceStub.remove.resolves(true);
        return request(expressApp)
            .delete('/api/admin/dictionary/123')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.DELETED);
            });
    });
    it('DELETE /dictionary/ with id returns an error ', async () => {
        dictionaryServiceStub.remove.resolves(false);
        return request(expressApp)
            .delete('/api/admin/dictionary/123')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.BAD_REQUEST);
            });
    });
    it('POST /dictionary/upload ', async () => {
        // const payload = [metadata, metadata];
        // dictionaryServiceStub.update.resolves({ isSuccess: true, payload });
        return request(expressApp)
            .post('/api/admin/dictionary/upload')
            .send(new Error())
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });
    it('POST /dictionary/upload fails to upload ', async () => {
        // const payload = [metadata, metadata];
        // dictionaryServiceStub.update.resolves({ isSuccess: false, payload });
        file.mimetype = ' ';
        return request(expressApp)
            .post('/api/admin/dictionary/upload')
            .send(file)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.BAD_REQUEST);
            });
    });

    it('POST /dictionary/upload fails to upload ', async () => {
        dictionaryServiceStub.add.throws(new Error('Error test'));
        return request(expressApp)
            .post('/api/admin/dictionary/upload')
            .send(file)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.BAD_REQUEST);
            });
    });

    it('GET /playername/ ', async () => {
        const vp: VirtualPlayerName = { name: 'test1', level: VirtualPlayerLevel.Easy, isReadonly: true };
        adminServiceStub.getPlayerNames.resolves([vp]);
        return request(expressApp)
            .get('/api/admin/playername')
            .then((response) => {
                expect(response.text).to.be.equal('[{"name":"test1","level":"Easy","isReadonly":true}]');
            });
    });
    // it('POST /playername/set/:level wrong level ', async () => {
    //     adminServiceStub.addVirtualPlayer.resolves(true);
    //     return request(expressApp)
    //         .post('/api/admin/playername/set/test')
    //         .then((response) => {
    //             expect(response.status).to.be.equal(Constants.HTTP_STATUS.BAD_REQUEST);
    //         });
    // });
    it('POST /playername/set/:level ', async () => {
        adminServiceStub.addVirtualPlayer.resolves(true);
        return request(expressApp)
            .post('/api/admin/playername/set/Easy')
            .send([{ name: 'test1', level: 'Expert', isReadonly: true }])
            .then((response) => {
                console.log(response);
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.BAD_REQUEST);
            });
    });
    // it('GET /reset/ ', async () => {
    //     return request(expressApp)
    //         .get('/api/admin/reset')
    //         .then((response) => {
    //             expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
    //         });
    // });
});
