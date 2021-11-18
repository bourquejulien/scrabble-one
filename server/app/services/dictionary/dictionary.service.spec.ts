/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { DictionaryMetadata } from '@common';
import { expect } from 'chai';
import { DictionaryService } from './dictionary.service';
import mock from 'mock-fs';

describe('DictionaryService', () => {
    let service: DictionaryService;

    const dictionary: DictionaryMetadata = {
        id: 'not.json',
        description: 'Blablabla',
        title: 'My cool dictionary-handler',
        nbWords: 1024,
    };

    const defaultDictionary: DictionaryMetadata = {
        id: 'dictionary.json',
        description: 'Default Dictionary',
        title: 'Dictionnaire du serveur',
        nbWords: 2048,
    };

    beforeEach(() => {
        service = new DictionaryService();
        mock({
            'assets/': {
                'dictionary.json': '{"title":"Dico", "description":"French dictionary-handler", "words":["alpha", "beta", "gamma"]}',
                'not.json': Buffer.from([1, 2, 3]),
            },
        });
    });

    afterEach(() => {
        mock.restore();
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should parse correctly', () => {
        service.add(defaultDictionary);
        const metadata = service.getMetadata(dictionary.id);
        if (metadata) {
            expect(service.parse(service.getFilepath(metadata))).to.be.true;
        } else {
            expect(metadata).not.to.be.undefined;
        }
    });

    it('should not parse invalid files', () => {
        service.add(dictionary);
        const metadata = service.getMetadata(dictionary.id);
        if (metadata) {
            expect(service.parse(service.getFilepath(metadata))).to.be.false;
        } else {
            expect(metadata).not.to.be.undefined;
        }
    });

    it('should handle dictionaries correctly', () => {
        service.add(dictionary);
        service.remove(dictionary);
        expect(service.dictionaries.length).to.equal(0);
    });

    it('should not get rid of the default dictionary-handler', () => {
        service.add(defaultDictionary);
        service.update([]);
        expect(service.dictionaries.length).to.equal(2);
        service.reset();
        service.update([dictionary]);
        expect(service.dictionaries.length).to.equal(2);
        service.reset();
        service.add(defaultDictionary);
        service.remove(defaultDictionary);
        expect(service.dictionaries.length).to.equal(1);
    });

    it('should get words properly', () => {
        let words = service.getWords(defaultDictionary);
        expect(words.length).to.equal(0);
        words = service.getWords(dictionary);
        expect(words.length).to.equal(0);
    });
});
