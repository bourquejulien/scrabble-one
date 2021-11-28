// /* eslint-disable no-unused-expressions */
// /* eslint-disable @typescript-eslint/no-unused-expressions */
// import { DictionaryMetadata, JsonDictionary } from '@common';
// import { expect } from 'chai';
// import { DictionaryService } from './dictionary.service';
// import mock from 'mock-fs';
//
// describe('DictionaryService', () => {
//     let service: DictionaryService;
//
//     const dictionary: DictionaryMetadata = {
//         id: 'not.json',
//         description: 'Blablabla',
//         title: 'My cool dictionary',
//         nbWords: 1024,
//     };
//
//     const defaultDictionary: DictionaryMetadata = {
//         id: 'dictionary.json',
//         description: 'Default Dictionary',
//         title: 'Dictionnaire du serveur',
//         nbWords: 2048,
//     };
//
//     const jsonDictionary: JsonDictionary = {
//         description: 'Default Dictionary',
//         title: 'Dictionnaire du serveur',
//         words: ['alpha', 'beta', 'gamma', 'omega'],
//     };
//
//     beforeEach(() => {
//         service = new DictionaryService();
//         mock({
//             'assets/': {
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
//     it('should parse correctly', async () => {
//         service.add(jsonDictionary, dictionary.id);
//         const metadata = service.getMetadata(dictionary.id);
//         if (metadata) {
//             expect(await service.parse(service.getFilepath(metadata))).to.equal(jsonDictionary.words);
//         } else {
//             expect(metadata).not.to.be.undefined;
//         }
//     });
//
//     it('should not parse invalid files', async () => {
//         service.add(jsonDictionary, 'not.json');
//         const metadata = service.getMetadata(dictionary.id);
//         if (metadata) {
//             expect(await service.parse(service.getFilepath(metadata))).to.be.false;
//         } else {
//             expect(metadata).not.to.be.undefined;
//         }
//     });
//
//     it('should handle dictionaries correctly', () => {
//         service.add(jsonDictionary, dictionary.id);
//         service.remove(dictionary);
//         expect(service.dictionaries.length).to.equal(0);
//     });
//
//     it('should not get rid of the default dictionary', () => {
//         service.add(jsonDictionary, dictionary.id);
//         service.update([]);
//         expect(service.dictionaries.length).to.equal(2);
//         service.reset();
//         service.update([dictionary]);
//         expect(service.dictionaries.length).to.equal(2);
//         service.reset();
//         service.add(jsonDictionary, '123');
//         service.remove(defaultDictionary);
//         expect(service.dictionaries.length).to.equal(1);
//     });
//
//     it('should get words properly', async () => {
//         service.add(jsonDictionary, defaultDictionary.id);
//         const words = await service.getWords(defaultDictionary);
//         expect(words.length).to.equal(3);
//         service.reset();
//         service.add(jsonDictionary, 'not.json');
//         expect(await service.getWords(dictionary)).to.throw('Not enough words in the chosen dictionary');
//     });
// });
