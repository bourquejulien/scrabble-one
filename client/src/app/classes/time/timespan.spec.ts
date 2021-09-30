import { TimeSpan } from './timespan';

describe('TimePipe', () => {
    it('should create an instance', () => {
        const timeSpan = TimeSpan.fromMilliseconds(0);
        expect(timeSpan).toBeTruthy();
    });

    it('should add time', () => {
        const timeSpan1 = TimeSpan.fromMilliseconds(0);
        const timeSpan2 = TimeSpan.fromSeconds(1);

        expect(timeSpan1.add(timeSpan2).seconds).toEqual(1);
    });

    it('should subtract time', () => {
        const timeSpan1 = TimeSpan.fromSeconds(1);
        const timeSpan2 = TimeSpan.fromSeconds(1);

        expect(timeSpan1.sub(timeSpan2).seconds).toEqual(0);
    });

    it('should convert to time units', () => {
        const MINUTES = 2;
        const SECONDS = 30;
        const SECONDS_IN_MINUTE = 60;
        const MILLISECONDS_IN_SECOND = 1000;
        const timeSpan = TimeSpan.fromMinutesSeconds(MINUTES, SECONDS);

        expect(timeSpan.seconds).toEqual(SECONDS);
        expect(timeSpan.totalMinutes).toEqual(MINUTES);
        expect(timeSpan.totalMilliseconds).toEqual((SECONDS_IN_MINUTE * MINUTES + SECONDS) * MILLISECONDS_IN_SECOND);
    });
});
