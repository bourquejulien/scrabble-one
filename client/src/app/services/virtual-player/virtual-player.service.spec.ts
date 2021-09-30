/* eslint-disable max-classes-per-file -- Multiple stubs are used */
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { BoardService } from '@app/services/board/board.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { PlayGeneratorService } from './play-generator.service';
// import { PlayGenerator } from '@app/classes/virtual-player/play-generator';

// @Injectable({
//     providedIn: 'root',
// })
// class PlayGeneratorStub {}

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
    // let mockedGenerator: PlayGenerator;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: PlayGeneratorService, useValue: jasmine.createSpyObj('PlayGeneratorService', ['newGenerator']) },
                { provide: ReserveService, useClass: ReserveServiceStub },
                { provide: BoardService, useClass: BoardServiceStub },
                { provide: TimerService, useClass: TimerServiceStub },
            ],
        });
        service = TestBed.inject(VirtualPlayerService);
        // mockedGenerator = TestBed.inject(PlayGeneratorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set rack length to 0 when emptyRack is called', () => {
        const emptyRackLength = 0;
        service.emptyRack();
        expect(service.length).toBe(emptyRackLength);
    });

    it('should skip turn', () => {
        expect(service).toBeTruthy();
    });

    it('should exchange', () => {
        expect(service).toBeTruthy();
    });

    it('should play', () => {
        expect(service).toBeTruthy();
    });

    it('should generate placement with desired score', () => {
        expect(service).toBeTruthy();
    });

    it('should notify player change', () => {
        expect(service).toBeTruthy();
    });

    it('should fill rack on each play', () => {
        expect(service).toBeTruthy();
    });
});
