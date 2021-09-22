import { Observable, timer } from "rxjs";
import { takeWhile } from "rxjs/operators";

export interface Timer {
    minutesLimit: number;
    secondsLimit: number;
    displayedTimer: string;
}

export class Timer implements Timer {
    initTimerLimits(minutes: number, seconds: number): void {
        this.minutesLimit = minutes;
        this.secondsLimit = seconds;
    }

    stringifyTimer(displayedSeconds: number, displayedMinutes: number): string | undefined {
        if (displayedSeconds < 10) {
            this.displayedTimer = `${displayedMinutes}:0${displayedSeconds} `;
            return `${displayedMinutes}:0${displayedSeconds} `;
        }

        if (displayedMinutes < 10) {
            this.displayedTimer = `0${displayedMinutes}:${displayedSeconds} `;
            return `0${displayedMinutes}:${displayedSeconds} `;
        }

        if (displayedMinutes < 10 && displayedSeconds < 10) {
            this.displayedTimer = `0${displayedMinutes}:0${displayedSeconds} `;
            return `0${displayedMinutes}:0${displayedSeconds} `;
        }
        return 'Timer Error';
    }

    countDown(time: number): Observable<any> {
        const oneSecond = 1000;
        let displayedSeconds = time;//this.secondsLimit;
        let displayedMinutes = this.minutesLimit / 60;

        return new Observable<any>(
            timerInstance => {
                timer(0, oneSecond)
                    .pipe(takeWhile(limitInSeconds => limitInSeconds >= 0))

                    .subscribe((currentSecond: number) => {


                        timerInstance.next({
                            display: this.stringifyTimer(displayedSeconds, displayedMinutes)

                        });

                        if (displayedSeconds <= 0 && displayedMinutes <= 0)
                            timerInstance.complete();
                    })
            }
        )
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