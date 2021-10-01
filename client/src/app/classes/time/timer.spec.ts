import { fakeAsync, discardPeriodicTasks, tick } from '@angular/core/testing';
import { asyncScheduler } from 'rxjs';
import { Timer } from './timer';
import { TimeSpan } from './timespan';

describe('Timer', () => {
    let currentTime: number;

    const changeTime = (milliseconds: number): void => {
        currentTime += milliseconds;
        tick(milliseconds);
    };

    beforeEach(() => {
        currentTime = 0;
        asyncScheduler.now = () => currentTime;
    });

    it('should create an instance', () => {
        const timer = new Timer();
        expect(timer).toBeTruthy();
    });

    it('should return initial time when stopped', () => {
        const timer = new Timer();
        expect(timer).toBeTruthy();
    });

    it('should return 0 time when stopped', () => {
        const INITIAL_TIME_MS = 1000;
        const timer = new Timer();
        timer.start(TimeSpan.fromMilliseconds(INITIAL_TIME_MS));
        timer.stop();

        expect(timer.time.totalMilliseconds).toEqual(0);
    });

    it('should be completed when stopped', (done) => {
        const INITIAL_TIME_MS = 1000;
        const timer = new Timer();

        timer.start(TimeSpan.fromMilliseconds(INITIAL_TIME_MS));

        timer.completed.then(() => {
            expect(timer.time.totalMilliseconds).toEqual(0);
            done();
        });

        timer.stop();
    });

    it('should decrease each seconds', fakeAsync(() => {
        const INITIAL_TIME_MS = 5000;
        const PERIOD = 1000;
        const timer = new Timer();

        timer.start(TimeSpan.fromMilliseconds(INITIAL_TIME_MS));

        for (let i = 1; i < INITIAL_TIME_MS / PERIOD; i++) {
            changeTime(PERIOD);
            expect(timer.time.totalMilliseconds).toEqual(INITIAL_TIME_MS - PERIOD * i);
        }

        changeTime(PERIOD);

        timer.start(TimeSpan.fromMilliseconds(INITIAL_TIME_MS));

        discardPeriodicTasks();

        expect(timer.time.totalMilliseconds).toEqual(INITIAL_TIME_MS);
    }));
});
