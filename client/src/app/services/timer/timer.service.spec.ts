import { discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PlayerType } from '@app/classes/player-type';
import { TimeSpan } from '@app/classes/time/timespan';
import { asyncScheduler } from 'rxjs';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;
    let currentTime: number;

    const changeTime = (milliseconds: number): void => {
        currentTime += milliseconds;
        tick(milliseconds);
    };

    beforeEach(() => {
        currentTime = 0;
        asyncScheduler.now = () => currentTime;
    });

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have a 0 time value after reset', () => {
        service.start(TimeSpan.fromSeconds(1), PlayerType.Local);
        service.reset();

        expect(service.time).toEqual(service.time);
    });

    it('should have a 0 time value after multiple resets', () => {
        service.reset();
        service.reset();

        expect(service.time).toEqual(service.time);
    });

    it('should stop timer after player turn', fakeAsync(() => {
        const INITIAL_TIME_MS = 1000;
        service.start(TimeSpan.fromMilliseconds(INITIAL_TIME_MS), PlayerType.Local);
        expect(service.time.totalMilliseconds).toEqual(INITIAL_TIME_MS);

        changeTime(INITIAL_TIME_MS);

        discardPeriodicTasks();

        expect(service.time.totalMilliseconds).toEqual(0);
    }));
});
