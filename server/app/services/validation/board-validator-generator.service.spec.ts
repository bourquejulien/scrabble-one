/* eslint-disable no-unused-expressions -- Needed for chai library assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import { Board } from '@app/classes/board/board';
import { Config } from '@app/config';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { Container } from 'typedi';
import { BoardValidatorGeneratorService } from './board-validator-generator.service';

describe('BoardValidatorGeneratorService', () => {
    let service: BoardValidatorGeneratorService;
    let board: Board;

    beforeEach(() => {
        createStubInstance(DictionaryService);
        service = Container.get(BoardValidatorGeneratorService);
        board = new Board(Config.GRID.GRID_SIZE);
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should generate a board validator', () => {
        expect(service.generator(board)).to.be.ok;
    });
});
