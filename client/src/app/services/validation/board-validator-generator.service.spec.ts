import { TestBed } from '@angular/core/testing';
import { Board } from '@app/classes/board/board';
import { Constants } from '@app/constants/global.constants';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';

import { BoardValidatorGeneratorService } from './board-validator-generator.service';

describe('BoardValidatorGeneratorService', () => {
    let service: BoardValidatorGeneratorService;
    let board: Board;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: DictionaryService, useValue: {} }],
        });
        service = TestBed.inject(BoardValidatorGeneratorService);
        board = new Board(Constants.GRID.GRID_SIZE);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should generate a board validator', () => {
        expect(service.generator(board)).toBeTruthy();
    });
});
