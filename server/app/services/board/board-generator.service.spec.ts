/* eslint-disable no-unused-expressions -- Needed for chai library assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { BoardGeneratorService } from './board-generator.service';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';

describe('BoardHandlingService', () => {
    let service: BoardGeneratorService;

    beforeEach(() => {
        const sessionHandlingServiceStub = createStubInstance(SessionHandlingService);
        const dictionaryServiceStub = createStubInstance(DictionaryService);
        sessionHandlingServiceStub.getHandler.returns(new SessionHandler('', { playerInfo: [] }, {} as unknown as BoardHandler));
        service = new BoardGeneratorService(dictionaryServiceStub as unknown as DictionaryService);
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should generate a board', () => {
        expect(service.generateBoard()).to.be.ok;
    });
});
