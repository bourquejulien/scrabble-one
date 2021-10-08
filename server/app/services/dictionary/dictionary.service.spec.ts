/* eslint-disable no-unused-expressions -- Needed for chai library assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { Container } from 'typedi';

const WORDS = ['pomme', 'orange', 'poire', 'raisin', 'peche', 'banane', 'bananes'];

describe('DictionaryService', () => {
    let service: DictionaryService;

    beforeEach(() => {
        service = Container.get(DictionaryService);
        // eslint-disable-next-line dot-notation -- This method is only used publicly for testing
        service['insertWords'](WORDS);
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should contain word', () => {
        for (const word of WORDS) {
            expect(service.lookup(word)).to.be.true;
        }
    });

    it('should contain the start of a word', () => {
        for (const word of WORDS) {
            expect(service.lookUpStart(word.substring(0, word.length - 3)).isOther).to.be.true;
        }
    });

    it('should contain the end of a word', () => {
        for (const word of WORDS) {
            expect(service.lookUpEnd(word.substring(word.length - 3))).to.be.true;
        }
    });
});