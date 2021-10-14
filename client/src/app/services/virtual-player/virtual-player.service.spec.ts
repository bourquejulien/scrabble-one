import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlayerType } from '@app/classes/player-type';
import { Timer } from '@app/classes/time/timer';
import { TimeSpan } from '@app/classes/time/timespan';
import { TimerService } from '@app/services/timer/timer.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';

const MAX_PLAYTIME_SECONDS = 20;

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

    stop() {
        this.gotStopped = true;
    }
}

describe('VirtualPlayerService', () => {
    let service: VirtualPlayerService;
    let timerServiceStub: TimerServiceStub;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: TimerService, useClass: TimerServiceStub }],
        });
        service = TestBed.inject(VirtualPlayerService);

        // eslint-disable-next-line dot-notation -- Need to replacer the real timer
        service['minTimer'] = jasmine.createSpyObj('Timer', ['start', 'stop'], [{ completed: Promise.resolve() }]) as Timer;

        timerServiceStub = TestBed.inject(TimerService) as unknown as TimerServiceStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should notify player change', (done) => {
        service.turnComplete.subscribe((playerType) => {
            expect(playerType).toEqual(PlayerType.Virtual);
            done();
        });

        service.startTurn(TimeSpan.fromSeconds(MAX_PLAYTIME_SECONDS));
    });

    it('should start and stop timer', async () => {
        await service.startTurn(TimeSpan.fromSeconds(MAX_PLAYTIME_SECONDS));

        expect(timerServiceStub.gotStarted).toBeTrue();
        expect(timerServiceStub.gotStopped).toBeTrue();
    });

    it('should be reset', () => {
        service.playerData = { score: 3, skippedTurns: 3, rack: [] };
        service.startTurn(TimeSpan.fromSeconds(MAX_PLAYTIME_SECONDS));
        service.reset();

        expect(service.playerData).toEqual({ score: 0, skippedTurns: 0, rack: [] });
        // eslint-disable-next-line dot-notation -- Need to validate private property
        expect(service['minTimer'].stop).toHaveBeenCalled();
    });
});
