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
import { DictionaryMetadata } from '@common';

const PATH = process.cwd() + '/assets/dictionary.json';

describe.only('AdminController', () => {
    let expressApp: Express.Application;
    let dictionaryServiceStub: SinonStubbedInstance<DictionaryService>;
    let file: File;
    let incomingFormStub: SinonStub;
    const metadata: DictionaryMetadata = {
        id: 'dictionary.json',
        description: 'dictionary for tests',
        nbWords: 1024,
        title: 'Grand Dictionary of Tests',
    };

    beforeEach(async () => {
        dictionaryServiceStub = createStubInstance(DictionaryService);
        dictionaryServiceStub.getFilepath.returns(PATH);
        dictionaryServiceStub.getMetadata.returns(metadata);
        stub(dictionaryServiceStub, 'dictionaries').returns([metadata]);
        file = createStubInstance(File) as unknown as File;
        file.mimetype = 'application/json';
        incomingFormStub = stub(IncomingForm.prototype, 'on').callsFake((name: string, callback: () => void) => {
            if (name === 'file') {
                callback();
            }
        });
        const app = Container.get(Application);
        Object.defineProperty(app['adminController'], 'dictionaryService', { value: dictionaryServiceStub });
        expressApp = app.app;
    });

    afterEach(() => {
        incomingFormStub.restore();
    });

    it('POST /dictionary/ ', async () => {
        return request(expressApp)
            .post('/api/admin/dictionary')
            .send({})
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });

    it('GET /dictionary/ ', async () => {
        return request(expressApp)
            .get('/api/admin/dictionary/')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });

    it('GET /dictionary/ with id ', async () => {
        return request(expressApp)
            .get('/api/admin/dictionary/123')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });

    it('POST /dictionary/upload ', async () => {
        dictionaryServiceStub.parse.returns(true);
        return request(expressApp)
            .post('/api/admin/dictionary/upload')
            .send({})
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });

    it('POST /dictionary/upload ', async () => {
        dictionaryServiceStub.parse.returns(false);
        return request(expressApp)
            .post('/api/admin/dictionary/upload')
            .send({})
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.BAD_REQUEST);
            });
    });

    it('POST /playername/ ', async () => {
        return request(expressApp)
            .post('/api/admin/playername')
            .send({})
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });

    it('GET /playername/ ', async () => {
        return request(expressApp)
            .get('/api/admin/playername')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });

    it('GET /reset/ ', async () => {
        return request(expressApp)
            .get('/api/admin/reset')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });
});
