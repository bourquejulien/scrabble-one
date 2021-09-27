import { TestBed } from '@angular/core/testing';
import { PlayGeneratorService } from '@app/services/virtual-player/play-generator.service';
import { BoardService } from '@app/services/board/board.service';
import { MockBoardService } from '@app/services/board/mock-board.service';
import { Injectable } from '@angular/core';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';

@Injectable({
    providedIn: 'root',
})
class StubDictionaryService {
    // Does nothing
}

describe('PlayGeneratorService', () => {
    let service: PlayGeneratorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: BoardService, useClass: MockBoardService },
                { provide: DictionaryService, useClass: StubDictionaryService },
            ],
        });
        service = TestBed.inject(PlayGeneratorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return a PlayGenerator', () => {
        expect(service.newGenerator([])).toBeTruthy();
    });
});
