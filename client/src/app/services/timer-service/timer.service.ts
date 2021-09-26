import { Injectable } from '@angular/core';
import { TimeSpan } from '@app/classes/time/timespan';
import { Timer } from '@app/classes/time/timer';
import { Subject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    readonly countdownStopped: Subject<void> = new Subject();

    private timer: Timer | null = null;
    private countdownSubscription: Subscription | null = null;

    start(delay: TimeSpan): void {
        this.timer = new Timer(delay);
        this.timer.startTimer();
        this.countdownSubscription = this.timer.timerUpdated.subscribe((timeSpan) => {
            if (timeSpan.totalMilliseconds <= 0) {
                this.countdownStopped.next();
                this.reset();
            }
        });
    }

    reset() {
        if (this.countdownSubscription !== null) {
            this.countdownSubscription.unsubscribe();
            this.countdownSubscription = null;
        }
        this.timer = null;
    }

    get time(): TimeSpan {
        if (this.timer !== null) {
            return this.timer.time;
        } else {
            return TimeSpan.fromMilliseconds(0);
        }
    }
}
