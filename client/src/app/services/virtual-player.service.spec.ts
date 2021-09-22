/* eslint-disable max-classes-per-file -- Multiple stubs are used */
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VirtualPlayerService } from '@app/services/virtual-player.service';
import { BoardService } from './board/board.service';
import { DictionaryService } from './dictionary/dictionary.service';

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
});
