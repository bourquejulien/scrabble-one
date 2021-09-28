import { Pipe, PipeTransform } from '@angular/core';
import { TimeSpan } from './timespan';

@Pipe({
    name: 'time',
})
export class TimePipe implements PipeTransform {
    transform(timeSpan: TimeSpan): unknown {
        const MINUTES_DIGIT = -1;
        const SECONDS_DIGIT = -2;
        const minutes = ('00' + timeSpan.totalMinutes.toString()).slice(MINUTES_DIGIT);
        const seconds = ('00' + timeSpan.seconds.toString()).slice(SECONDS_DIGIT);

        return `${minutes}:${seconds}`;
    }
}
