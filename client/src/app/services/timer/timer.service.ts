import { Injectable } from '@angular/core';
import { TimeSpan } from '@app/classes/time/timespan';
import { Timer } from '@app/classes/time/timer';
import { Subject, Subscription } from 'rxjs';
import { PlayerType } from '@app/classes/player/player-type';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    readonly countdownStopped: Subject<PlayerType> = new Subject();

    private timer: Timer;
    private countdownSubscription: Subscription | null = null;

    constructor(private readonly socketService: SocketClientService) {
        this.timer = new Timer();
    }

    start(delay: TimeSpan, playerType: PlayerType): void {
        this.timer.start(delay);
        this.socketService.socketClient.on('timerTick', () => {
            if (this.timer.time.totalMilliseconds <= 0) {
                this.stop();
                this.countdownStopped.next(playerType);
            }
        });
        this.timer.timerUpdated.subscribe(() => {
            if (this.timer.time.totalMilliseconds <= 0) {
                this.stop();
                this.countdownStopped.next(playerType);
            }
        });
    }

    stop() {
        this.socketService.socketClient.emit('clientTimerStop');
        /* if (this.countdownSubscription !== null) {
            this.countdownSubscription.unsubscribe();
            this.countdownSubscription = null;
        } */
    }

    get time(): TimeSpan {
        if (this.countdownSubscription !== null) {
            return this.timer.time;
        } else {
            return TimeSpan.fromMilliseconds(0);
        }
    }
}
