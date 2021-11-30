// /* eslint-disable dot-notation,
// @typescript-eslint/no-unused-expressions,
// @typescript-eslint/no-empty-function,
// no-unused-expressions,
// */
// import { expect } from 'chai';
// import { DatabaseService } from '@app/services/database/database.service';
// import Sinon, { assert, createSandbox, createStubInstance, SinonSandbox, SinonStubbedInstance, stub } from 'sinon';
// import { Collection, Db } from 'mongodb';
// import { DictionaryPersistence } from '@app/services/dictionary/dictionary-persistence';
// import { DictionaryMetadata } from '@common';
//
// describe('DictionaryPersistence', () => {
//     let service: DictionaryPersistence;
//     let dbServiceStub: SinonStubbedInstance<DatabaseService>;
//     let sandbox: SinonSandbox;
//     let dbStub: Sinon.SinonStubbedInstance<Db>;
//     const DEFAULT_PATH = 'assets/dictionaries/dictionary.json';
//     const defaultMetadata: DictionaryMetadata = {
//         _id: 'dictionary.json',
//         path: DEFAULT_PATH,
//         description: 'Default Dictionary',
//         title: 'Dictionnaire du serveur',
//         nbWords: 402503,
//     };
//     beforeEach(() => {
//         sandbox = createSandbox();
//         dbServiceStub = sandbox.createStubInstance(DatabaseService);
//         dbStub = sandbox.createStubInstance(Db);
//         // dbStub['collection'] =
//         createStubInstance(Collection);
//         dbStub['collection']['findOne'].resolves(defaultMetadata);
//         dbStub['collection']['findOneAndUpdate'].resolves(defaultMetadata);
//         dbStub['collection']['find'].resolves(defaultMetadata);
//         dbStub['collection']['deleteOne'].resolves(defaultMetadata);
//         dbStub['collection']['insertOne'].resolves(defaultMetadata);
//         stub(dbServiceStub, 'database').get(() => {
//             return dbStub;
//         });
//         service = new DictionaryPersistence(dbServiceStub as unknown as DatabaseService);
//     });
//     afterEach(() => {
//         sandbox.restore();
//     });
//     it('should be created', () => {
//         expect(service).to.be.ok;
//     });
//     it('should add metadata', async () => {
//         expect(await service.add(defaultMetadata)).to.be.false;
//     });
//     it('should reset', async () => {
//         await service.reset();
//         assert.calledOnce(dbStub.dropCollection);
//         expect(service['metaDataCache'].size).to.equal(1);
//     });
//     it('should get metadata by id', async () => {
//         service['metaDataCache'].set(defaultMetadata._id, defaultMetadata);
//     });
// });
