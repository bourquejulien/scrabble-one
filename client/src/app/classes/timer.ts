import { Observable, Subject, timer } from "rxjs";
import { repeatWhen, takeUntil } from "rxjs/operators";

export interface Timer {
    minutesLimit: number;
    secondsLimit: number;
    displayedTimer: string;
    timerInstance: Observable<any>;
    startCountdown: Subject<void>;
    stopCountdown: Subject<void>;
    displayedSeconds: number;
    displayedMinutes: number;
}

const oneSecond = 1000;

export class Timer implements Timer {
    constructor() {
        this.displayedSeconds = 0;//this.secondsLimit;
        this.displayedMinutes = 1;//this.minutesLimit;

        this.startCountdown = new Subject<void>();
        this.stopCountdown = new Subject<void>();
        this.timerInstance = new Observable<any>();

        this.timerInstance =
            timer(0, oneSecond)
                .pipe(takeUntil(this.stopCountdown), repeatWhen(() => this.startCountdown));
        this.stopTimer();
    }

    initTimerLimits(minutes: number, seconds: number): void {
        this.minutesLimit = minutes;
        this.secondsLimit = seconds;
    }

    stringifyTimer(displayedSeconds: number, displayedMinutes: number): string {
        if (displayedMinutes >= 10 && displayedSeconds < 10) { // Ex: 10:09
            this.displayedTimer = `${displayedMinutes}:0${displayedSeconds} `;
            return `${displayedMinutes}:0${displayedSeconds} `;
        }

        if (displayedMinutes < 10 && displayedSeconds > 10) { // Ex: 09:10
            this.displayedTimer = `0${displayedMinutes}:${displayedSeconds} `;
            return `0${displayedMinutes}:${displayedSeconds} `;
        }

        if (displayedMinutes < 10 && displayedSeconds < 10) { // Ex: 09:09
            this.displayedTimer = `0${displayedMinutes}:0${displayedSeconds} `;
            return `0${displayedMinutes}:0${displayedSeconds} `;
        }
        return 'Timer Error';
    }

    startTimer(): void {
        console.log('started timer');
        this.startCountdown.next();
    }

    stopTimer(): void {
        this.displayedSeconds = 0;//this.secondsLimit;
        this.displayedMinutes = 1;//this.minutesLimit;
        console.log('stopped timer');
        this.stopCountdown.next();
    }

    getTimerCountdown(timer: Timer): void {
        timer.displayedSeconds--;

        if (timer.displayedSeconds < 0 && timer.displayedMinutes > 0) {
            timer.displayedSeconds = 59;
            timer.displayedMinutes--;
        }

        timer.stringifyTimer(timer.displayedSeconds, timer.displayedMinutes);

        if (timer.displayedSeconds <= 0 && timer.displayedMinutes <= 0) {
            timer.stopTimer();
        }
        console.log(timer.displayedTimer);
    }
}