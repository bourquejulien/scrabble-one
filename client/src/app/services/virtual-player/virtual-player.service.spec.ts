/* eslint-disable max-classes-per-file -- Multiple stubs are used */
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { TimeSpan } from '@app/classes/time/timespan';
import { PlayerType } from '@app/classes/player-type';
import { VirtualPlayerActionService } from './virtual-player-action.service';
import { Action } from './actions/action';
import { PlayerData } from '@app/classes/player-data';

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const MAX_PLAYTIME_SECONDS = 20;

@Injectable({
    providedIn: 'root',
})
class ReserveServiceStub {
    letters = LETTERS.slice();
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
class TimerServiceStub {
    gotStarted = false;
    gotStopped = false;

    start(span: TimeSpan, playerType: PlayerType) {
        expect(playerType).toEqual(PlayerType.Virtual);
        expect(span.seconds).toEqual(MAX_PLAYTIME_SECONDS);

        this.gotStarted = true;
    }

    reset() {
        this.gotStopped = true;
    }
}

@Injectable({
    providedIn: 'root',
})
class VirtualPlayerActionServiceMock {
    actionCalled: number = 0;

    // eslint-disable-next-line no-unused-vars -- Not needed for testing
    getNextAction(playerData: PlayerData): Action {
        return { execute: () => this.execute() };
    }

    private execute(): Action {
        this.actionCalled++;
        return { execute: () => this.execute() };
    }
}

describe('VirtualPlayerService', () => {
    let service: VirtualPlayerService;
    let timerServiceStub: TimerServiceStub;
    let virtualPlayerActionServiceMock: VirtualPlayerActionServiceMock;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: ReserveService, useClass: ReserveServiceStub },
                { provide: TimerService, useClass: TimerServiceStub },
                { provide: VirtualPlayerActionService, useClass: VirtualPlayerActionServiceMock },
            ],
        });
        service = TestBed.inject(VirtualPlayerService);
        timerServiceStub = TestBed.inject(TimerService) as unknown as TimerServiceStub;
        virtualPlayerActionServiceMock = TestBed.inject(VirtualPlayerActionService) as unknown as VirtualPlayerActionServiceMock;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should execute action', async () => {
        await service.startTurn();

        expect(virtualPlayerActionServiceMock.actionCalled).toEqual(2);
    });

    it('should notify player change', (done) => {
        service.turnComplete.subscribe((playerType) => {
            expect(playerType).toEqual(PlayerType.Virtual);
            done();
        });

        service.startTurn();
    });

    it('should fill rack', () => {
        service.fillRack();
        // eslint-disable-next-line dot-notation -- Need to validate private property
        expect(service['playerData'].rack.length).toEqual(LETTERS.length);
    });

    it('should start and stop timer', async () => {
        await service.startTurn();

        expect(timerServiceStub.gotStarted).toBeTrue();
        expect(timerServiceStub.gotStopped).toBeTrue();
    });
});
