// /* eslint-disable @typescript-eslint/ban-types */
// /* eslint-disable no-unused-expressions */
// /* eslint-disable @typescript-eslint/no-unused-expressions */
// /* eslint-disable @typescript-eslint/no-magic-numbers */
// /* eslint-disable dot-notation */
// import { Application } from '@app/app';
// import { Constants } from '@app/constants';
// import { expect } from 'chai';
// import { stub, createStubInstance, SinonStubbedInstance, SinonStub } from 'sinon';
// import request from 'supertest';
// import { Container } from 'typedi';
// import { DictionaryService } from '@app/services/dictionary/dictionary.service';
// import { IncomingForm, File } from 'formidable';
// import { DictionaryMetadata, JsonDictionary } from '@common';
//
// const metadata: DictionaryMetadata = {
//     _id: 'dictionary.json',
//     path: 'dictionary.json',
//     description: 'dictionary for tests',
//     nbWords: 1024,
//     title: 'Grand Dictionary of Tests',
// };
//
// const jsonDictionary: JsonDictionary = {
//     words: ['alpha', 'beta', 'gamma'],
//     title: 'Dictionnaire',
//     description: 'Description',
// };
//
// describe('AdminController', () => {
//     let expressApp: Express.Application;
//     let dictionaryServiceStub: SinonStubbedInstance<DictionaryService>;
//     let file: File;
//     let incomingFormStub: SinonStub;
//     beforeEach(async () => {
//         dictionaryServiceStub = createStubInstance(DictionaryService);
//         dictionaryServiceStub.getMetadataById.resolves(metadata);
//         file = createStubInstance(File) as unknown as File;
//         file.mimetype = 'application/json';
//         incomingFormStub = stub(IncomingForm.prototype, 'on').callsFake((name: string, callback: (filename: string, file: File) => void) => {
//             if (name === 'file') {
//                 callback('filename', file);
//             }
//         });
//         const app = Container.get(Application);
//         Object.defineProperty(app['adminController'], 'dictionaryService', { value: dictionaryServiceStub });
//         expressApp = app.app;
//     });
//
//     afterEach(() => {
//         incomingFormStub.restore();
//     });
//
//     it('GET /dictionary/ ', async () => {
//         return request(expressApp)
//             .get('/api/admin/dictionary/')
//             .then((response) => {
//                 expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
//             });
//     });
//
//     it('GET /dictionary/ with id ', async () => {
//         dictionaryServiceStub.getJsonDictionary.resolves(jsonDictionary);
//         return request(expressApp)
//             .get('/api/admin/dictionary/123')
//             .then((response) => {
//                 expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
//             });
//     });
//
//     it('DELETE /dictionary/ with id ', async () => {
//         return request(expressApp)
//             .delete('/api/admin/dictionary/123')
//             .then((response) => {
//                 expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
//             });
//     });
//
//     it('DELETE /dictionary/ with id returns an error ', async () => {
//         dictionaryServiceStub.remove.resolves(false);
//         return request(expressApp)
//             .delete('/api/admin/dictionary/123')
//             .then((response) => {
//                 expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
//             });
//     });
//
//     it('POST /dictionary/upload ', async () => {
//         // dictionaryServiceStub.parse.resolves(jsonDictionary);
//         return request(expressApp)
//             .post('/api/admin/dictionary/upload')
//             .send({})
//             .then((response) => {
//                 expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
//             });
//     });
//
//     it('POST /dictionary/upload fails to update ', async () => {
//         dictionaryServiceStub.update.resolves(false);
//         return request(expressApp)
//             .post('/api/admin/dictionary/upload')
//             .send({})
//             .then((response) => {
//                 expect(response.status).to.be.equal(Constants.HTTP_STATUS.BAD_REQUEST);
//             });
//     });
//
//     it('POST /playername/ ', async () => {
//         return request(expressApp)
//             .post('/api/admin/playername')
//             .send({})
//             .then((response) => {
//                 expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
//             });
//     });
//
//     it('GET /playername/ ', async () => {
//         return request(expressApp)
//             .get('/api/admin/playername')
//             .then((response) => {
//                 expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
//             });
//     });
//
//     it('GET /reset/ ', async () => {
//         return request(expressApp)
//             .get('/api/admin/reset')
//             .then((response) => {
//                 expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
//             });
//     });
// });
