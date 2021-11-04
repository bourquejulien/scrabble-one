import { Injectable } from '@angular/core';
import { TimeSpan } from '@app/classes/time/timespan';
import { PlayerService } from '@app/services/player/player.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

const MS_TO_SEC_FACTOR = 1000;

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    private timeSpan: TimeSpan;

    constructor(socketService: SocketClientService, private readonly playerService: PlayerService) {
        this.timeSpan = TimeSpan.fromMilliseconds(0);
        socketService.on('timerTick', (time: { ms: number }) => this.onTicks(time.ms));
    }

    get time(): TimeSpan {
        return this.timeSpan;
    }

    private onTicks(timeMs: number): void {
        this.timeSpan = TimeSpan.fromSeconds(Math.round(timeMs / MS_TO_SEC_FACTOR));

        if (timeMs <= 0) {
            this.playerService.skipTurn();
        }
    }
}
