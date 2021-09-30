/* eslint-disable max-classes-per-file -- Multiple stubs are used */
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { BoardService } from '@app/services/board/board.service';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';

@Injectable({
    providedIn: 'root',
})
class StubDictionaryService {}

@Injectable({
    providedIn: 'root',
})
class BoardServiceStub {}

describe('VirtualPlayerService', () => {
    let service: VirtualPlayerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: BoardService, useClass: BoardServiceStub },
                { provide: DictionaryService, useClass: StubDictionaryService },
            ],
        });
        service = TestBed.inject(VirtualPlayerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set rack length to 0 when emptyRack is called', () => {
        const emptyRackLength = 0;
        service.emptyRack();
        expect(service.length).toBe(emptyRackLength);
    });
});
