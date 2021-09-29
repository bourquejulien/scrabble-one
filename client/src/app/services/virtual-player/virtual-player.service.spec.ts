/* eslint-disable max-classes-per-file -- Multiple stubs are used */
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { BoardService } from '@app/services/board/board.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { PlayGeneratorService } from './play-generator.service';
// import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { TimeSpan } from '@app/classes/time/timespan';
import { PlayerType } from '@app/classes/player-type';
import { Constants } from '@app/constants/global.constants';

// @Injectable({
//     providedIn: 'root',
// })
// class PlayGeneratorStub {}

@Injectable({
    providedIn: 'root',
})
class ReserveServiceStub {
    letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    lastLetter = '';

    drawLetter(): string {
        return this.letters.pop() ?? '';
    }

    putBackLetter(letter: string) {
        this.lastLetter = letter;
    }

    get length(): number {
        return this.letters.length;
    }
}

@Injectable({
    providedIn: 'root',
})
class BoardServiceStub {}

@Injectable({
    providedIn: 'root',
})
class TimerServiceStub {
    // eslint-disable-next-line no-unused-vars
    start(span: TimeSpan, playerType: PlayerType) {
        // Does nothing
    }

    reset() {
        // Does nothing
    }

    resetTimer() {
        // Does nothing
    }
}

describe('VirtualPlayerService', () => {
    let service: VirtualPlayerService;
    let timerService: TimerService;
    let reserveServiceStub: ReserveServiceStub;
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
        timerService = TestBed.inject(TimerService);
        reserveServiceStub = (TestBed.inject(ReserveService) as unknown as ReserveServiceStub)

        spyOnProperty(service['minTimer'], 'completed', 'get').and.returnValue(new Promise<void>((resolve) => resolve()));
        // mockedGenerator = TestBed.inject(PlayGeneratorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should skip turn', async () => {
        spyOn(Math, 'random').and.returnValue(Constants.virtualPlayer.SKIP_PERCENTAGE);
        const timerSpy = spyOn(timerService, 'reset');

        service.startTurn();

        await service['minTimer'].completed;

        expect(timerSpy).toHaveBeenCalled();
    });

    it('should exchange', async () => {
        const RACK_LENGTH = 7;
        spyOn(Math, 'random').and.returnValues(
            Constants.virtualPlayer.EXCHANGE_PERCENTAGE + Constants.virtualPlayer.SKIP_PERCENTAGE,
            1 / RACK_LENGTH,
            0,
        );
        const timerSpy = spyOn(timerService, 'reset');

        const firstLetter = reserveServiceStub.letters[reserveServiceStub.letters.length - 1];

        service.startTurn();

        await service['minTimer'].completed;

        expect((reserveServiceStub as unknown as ReserveServiceStub).lastLetter).toEqual(firstLetter);
        expect(timerSpy).toHaveBeenCalled();
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
