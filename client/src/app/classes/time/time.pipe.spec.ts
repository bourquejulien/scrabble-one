import { TimePipe } from './time.pipe';
import { TimeSpan } from './timespan';

describe('TimePipe', () => {
    it('should create an instance', () => {
        const pipe = new TimePipe();
        expect(pipe).toBeTruthy();
    });

    it('should format TimeSpan', () => {
        const pipe = new TimePipe();
        const timerSpan = TimeSpan.fromSeconds(1);

        expect(String(pipe.transform(timerSpan))).toEqual('0:01');
    });
});
