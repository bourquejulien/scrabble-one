/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { DictionaryService } from './dictionary.service';

describe('DictionaryService', () => {
    let service: DictionaryService;
    beforeEach(() => {
        service = new DictionaryService();
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });
});
