/* eslint-disable max-classes-per-file -- Multiple stubs are used */
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { BoardService } from '@app/services/board/board.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';

@Injectable({
    providedIn: 'root',
})
class PlayGeneratorServiceStub {}

@Injectable({
    providedIn: 'root',
})
class ReserveServiceStub {}

@Injectable({
    providedIn: 'root',
})
class BoardServiceStub {}

@Injectable({
    providedIn: 'root',
})
class TimerServiceStub {}

describe('VirtualPlayerService', () => {
    let service: VirtualPlayerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: PlayGenerator, useClass: PlayGeneratorServiceStub },
                { provide: ReserveService, useClass: ReserveServiceStub },
                { provide: BoardService, useClass: BoardServiceStub },
                { provide: TimerService, useClass: TimerServiceStub },
            ],
        });
        service = TestBed.inject(VirtualPlayerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
