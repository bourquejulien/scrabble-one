import { Observable, Subject, timer } from 'rxjs';
import { repeatWhen, takeUntil } from 'rxjs/operators';

export class Timer {
    minutesLimit: number;
    secondsLimit: number;

    timerInstance: Observable<unknown>;
    startCountdown: Subject<void>;
    stopCountdown: Subject<void>;

    displayedSeconds: number;
    displayedMinutes: number;
    displayedTimer: string;

    constructor(minutes: number, seconds: number) {
        const oneSecond = 1000;

        this.minutesLimit = minutes;
        this.secondsLimit = seconds;

        this.startCountdown = new Subject<void>();
        this.stopCountdown = new Subject<void>();
        this.timerInstance = new Observable<unknown>();

        this.timerInstance = timer(0, oneSecond).pipe(
            takeUntil(this.stopCountdown),
            repeatWhen(() => this.startCountdown),
        );
        this.stopTimer();
    }

    stringifyTimer(displayedSeconds: number, displayedMinutes: number): void {
        const twoDigitsDisplayed = 10;

        if (displayedMinutes >= twoDigitsDisplayed && displayedSeconds < twoDigitsDisplayed) {
            this.displayedTimer = `${displayedMinutes}:0${displayedSeconds} `;
        }

        if (displayedMinutes < twoDigitsDisplayed && displayedSeconds > twoDigitsDisplayed) {
            this.displayedTimer = `0${displayedMinutes}:${displayedSeconds} `;
        }

        if (displayedMinutes < twoDigitsDisplayed && displayedSeconds < twoDigitsDisplayed) {
            this.displayedTimer = `0${displayedMinutes}:0${displayedSeconds} `;
        }
    }

    startTimer(): void {
        this.startCountdown.next();
    }

    stopTimer(): void {
        this.displayedMinutes = this.minutesLimit;
        this.displayedSeconds = this.secondsLimit;
        this.stopCountdown.next();
    }

    getTimerCountdown(timerToStart: Timer): void {
        const maxSeconds = 59;
        timerToStart.displayedSeconds--;

        if (timerToStart.displayedSeconds < 0 && timerToStart.displayedMinutes > 0) {
            timerToStart.displayedSeconds = maxSeconds;
            timerToStart.displayedMinutes--;
        }

        timerToStart.stringifyTimer(timerToStart.displayedSeconds, timerToStart.displayedMinutes);

        if (timerToStart.displayedSeconds <= 0 && timerToStart.displayedMinutes <= 0) {
            timerToStart.stopTimer();
        }
    }
}
