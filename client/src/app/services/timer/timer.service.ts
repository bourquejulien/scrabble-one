import { Injectable } from '@angular/core';
import { TimeSpan } from '@app/classes/time/timespan';
import { Timer } from '@app/classes/time/timer';
import { Subject, Subscription } from 'rxjs';
import { PlayerType } from '@common/player-type';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    readonly countdownStopped: Subject<PlayerType> = new Subject();

    private timer: Timer;
    private countdownSubscription: Subscription | null = null;

    constructor() {
        this.timer = new Timer();
    }

    start(delay: TimeSpan, playerType: PlayerType): void {
        this.timer.start(delay);
        this.countdownSubscription = this.timer.timerUpdated.subscribe(() => {
            if (this.timer.time.totalMilliseconds <= 0) {
                this.stop();
                this.countdownStopped.next(playerType);
            }
        });
    }

    stop() {
        if (this.countdownSubscription !== null) {
            this.countdownSubscription.unsubscribe();
            this.countdownSubscription = null;
        }
    }

    get time(): TimeSpan {
        if (this.countdownSubscription !== null) {
            return this.timer.time;
        } else {
            return TimeSpan.fromMilliseconds(0);
        }
    }
}
