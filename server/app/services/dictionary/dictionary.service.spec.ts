// /* eslint-disable dot-notation,
// @typescript-eslint/no-unused-expressions,
// @typescript-eslint/no-empty-function,
// no-unused-expressions,
// */
// import { DictionaryMetadata } from '@common';
// import { expect } from 'chai';
// import { DictionaryService } from './dictionary.service';
// import mock from 'mock-fs';
// import { DictionaryPersistence } from '@app/services/dictionary/dictionary-persistence';
// import { assert, createStubInstance, SinonStubbedInstance } from 'sinon';
//
// describe('DictionaryService', () => {
//     let service: DictionaryService;
//     let dictionaryPersistenceStub: SinonStubbedInstance<DictionaryPersistence>;
//
//     // const notDictionary: DictionaryMetadata = {
//     //     _id: 'not.json',
//     //     path: 'assets/not.json',
//     //     description: 'Blablabla',
//     //     title: 'My cool dictionary',
//     //     nbWords: 1024,
//     // };
//
//     const defaultDictionary: DictionaryMetadata = {
//         _id: 'dictionary.json',
//         path: 'dictionary.json',
//         description: 'Default Dictionary',
//         title: 'Dictionnaire du serveur',
//         nbWords: 2048,
//     };
//
//     // const jsonDictionary: JsonDictionary = {
//     //     description: 'Default Dictionary',
//     //     title: 'Dictionnaire du serveur',
//     //     words: ['alpha', 'beta', 'gamma', 'omega'],
//     // };
//
//     beforeEach(() => {
//         dictionaryPersistenceStub = createStubInstance(DictionaryPersistence);
//         dictionaryPersistenceStub.add.resolves(true);
//         dictionaryPersistenceStub.defaultMetadata = defaultDictionary;
//         service = new DictionaryService(dictionaryPersistenceStub as unknown as DictionaryPersistence);
//         mock({
//             'assets/dictionaries/upload': {
//                 'dictionary.json': '{"title":"Dico", "description":"French dictionary", "words":["alpha", "beta", "gamma"]}',
//                 'not.json': Buffer.from([1, 2, 3]),
//             },
//         });
//     });
//
//     afterEach(() => {
//         mock.restore();
//     });
//
//     it('should be created', () => {
//         expect(service).to.be.ok;
//     });
//
//     it('should be initiated', async () => {
//         const handlersSize = service['handlers'].size;
//         await service.init();
//         expect(handlersSize).to.equal(handlersSize + 1);
//     });
//
//     it('should parse correctly', async () => {
//         const filepath = DictionaryService.getFilepath(defaultDictionary);
//         expect(await service.add(filepath)).to.be.false;
//     });
//
//     it('should not parse invalid files', async () => {
//         const filepath = DictionaryService.getFilepath(defaultDictionary);
//         expect(await service.add(filepath)).to.be.false;
//     });
//
//     it('should reset', async () => {
//         await service.reset();
//         assert.calledOnce(dictionaryPersistenceStub.reset);
//         assert.calledOnce(dictionaryPersistenceStub.add);
//     });
// });
