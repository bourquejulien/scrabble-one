import { TestBed } from '@angular/core/testing';
import { PlayerType } from '@common';
import { TimeSpan } from '@app/classes/time/timespan';
import { asyncScheduler } from 'rxjs';
import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;
    let currentTime: number;

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

    it('should have a 0 time value after stop', () => {
        service.start(TimeSpan.fromSeconds(1), PlayerType.Local);
        service.stop();

        expect(service.time.totalMilliseconds).toEqual(0);
    });

    it('time should not be 0 after starting timer', () => {
        service.start(TimeSpan.fromSeconds(1), PlayerType.Local);

        expect(service.time.totalMilliseconds).toEqual(TimeSpan.fromSeconds(1).totalMilliseconds);
    });

    it('should have a 0 time value after multiple stops', () => {
        service.stop();
        service.stop();

        expect(service.time.totalMilliseconds).toEqual(0);
    });
});
