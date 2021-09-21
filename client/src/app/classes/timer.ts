
export interface Timer {
    minutesLimit: number;
    secondsLimit: number;
}

export class Timer implements Timer {
    initTimerLimits(minutes: number, seconds: number): void {
        this.minutesLimit = minutes;
        this.secondsLimit = seconds;
    }

    countDown(time: number): void {

    }
}

/**
 * // RxJS v6+
import { of } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { range } from'rxjs';

//emit 1,2,3,4,5
const source$ = range(1,15);

//allow values until value from source is greater than 4, then complete
source$
  .pipe(takeWhile((val) => val <= 15))
  // log: 1,2,3,4
  .subscribe((val) => {if(val === 10)console.log(val)});

 */