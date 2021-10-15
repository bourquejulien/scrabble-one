/* eslint-disable no-unused-expressions -- Needed for chai library assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { BoardHandlingService } from './board-handling.service';
import { Board } from '@app/classes/board/board';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { SessionHandler } from '@app/classes/session-handler';

const BOARD_SIZE = 5;

describe('BoardHandlingService', () => {
    let service: BoardHandlingService;
    let board: Board;

    beforeEach(() => {
        board = new Board(BOARD_SIZE);
        const sessionHandlingServiceStub = createStubInstance(SessionHandlingService);
        const dictionaryServiceStub = createStubInstance(DictionaryService);
        sessionHandlingServiceStub.getHandler.returns(new SessionHandler('', { playerInfo: [] }, board));
        service = new BoardHandlingService(dictionaryServiceStub as unknown as DictionaryService, sessionHandlingServiceStub);
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should generate a board handler', () => {
        const boardHandler = service.getBoardHandler('');

        expect(boardHandler).to.be.ok;
        expect(boardHandler?.immutableBoard).to.equal(board);
    });

    it('should generate a board', () => {
        expect(service.generateBoard()).to.be.ok;
    });
});
