import { Injectable } from '@angular/core';
import { TimeSpan } from '@app/classes/time/timespan';
import { Timer } from '@app/classes/time/timer';
import { Subject, Subscription } from 'rxjs';
import { PlayerType } from '@app/classes/player-type';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    readonly countdownStopped: Subject<PlayerType> = new Subject();

    private timer: Timer | null = null;
    private countdownSubscription: Subscription | null = null;

    start(delay: TimeSpan, playerType: PlayerType): void {
        this.timer = new Timer(delay);
        this.timer.start();
        this.countdownSubscription = this.timer.timerUpdated.subscribe((timeSpan) => {
            if (timeSpan.totalMilliseconds <= 0) {
                this.reset();
                this.countdownStopped.next(playerType);
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
