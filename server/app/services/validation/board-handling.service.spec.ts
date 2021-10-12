/* eslint-disable no-unused-expressions -- Needed for chai library assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import { Board } from '@app/classes/board/board';
import { Config } from '@app/config';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { Container } from 'typedi';
import { BoardHandlingService } from './board-handling.service';

describe('BoardHandlingService', () => {
    let service: BoardHandlingService;
    let board: Board;

    beforeEach(() => {
        createStubInstance(DictionaryService);
        service = Container.get(BoardHandlingService);
        board = new Board(Config.GRID.GRID_SIZE);
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should generate a board handler', () => {
        expect(service.generator(board)).to.be.ok;
    });
});
