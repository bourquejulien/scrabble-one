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
        const timer = new Timer(TimeSpan.fromMilliseconds(0));
        expect(timer).toBeTruthy();
    });

    it('should return initial time when stopped', () => {
        const timer = new Timer(TimeSpan.fromMilliseconds(0));
        expect(timer).toBeTruthy();
    });

    it('should return initial time when stopped', () => {
        const INITIAL_TIME_MS = 1000;
        const timer = new Timer(TimeSpan.fromMilliseconds(INITIAL_TIME_MS));
        timer.start();
        timer.stop();

        expect(timer.time.totalMilliseconds).toEqual(INITIAL_TIME_MS);
    });

    it('should be completed when stopped', (done) => {
        const INITIAL_TIME_MS = 1000;
        const timer = new Timer(TimeSpan.fromMilliseconds(INITIAL_TIME_MS));

        timer.start();

        timer.completed.then(() => {
            expect(timer.time.totalMilliseconds).toEqual(INITIAL_TIME_MS);
            done();
        });

        timer.stop();


    });

    it('should decrease each seconds', fakeAsync(() => {
        const INITIAL_TIME_MS = 5000;
        const PERIOD = 1000;
        const timer = new Timer(TimeSpan.fromMilliseconds(INITIAL_TIME_MS));

        timer.start();

        for (let i = 1; i < INITIAL_TIME_MS / PERIOD; i++) {
            changeTime(PERIOD);
            expect(timer.time.totalMilliseconds).toEqual(INITIAL_TIME_MS - PERIOD * i);
        }

        changeTime(PERIOD);

        timer.start();

        discardPeriodicTasks();

        expect(timer.time.totalMilliseconds).toEqual(INITIAL_TIME_MS);
    }));
});
