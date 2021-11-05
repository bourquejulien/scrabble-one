/* eslint-disable no-unused-expressions -- Needed for chai library assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { BoardGeneratorService } from './board-generator.service';

describe('BoardHandlingService', () => {
    let service: BoardGeneratorService;

    beforeEach(() => {
        const dictionaryServiceStub = createStubInstance(DictionaryService);
        service = new BoardGeneratorService(dictionaryServiceStub as unknown as DictionaryService);
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should generate a board', () => {
        expect(service.generateBoardHandler(false)).to.be.ok;
    });
});
