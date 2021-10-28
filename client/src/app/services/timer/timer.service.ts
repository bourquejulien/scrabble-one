import { Injectable } from '@angular/core';
import { TimeSpan } from '@app/classes/time/timespan';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { PlayerService } from '@app/services/player/player.service';

@Injectable({
    providedIn: 'root',
})
export class TimerService {
    private timeSpan: TimeSpan;

    constructor(socketService: SocketClientService, playerService: PlayerService) {
        this.timeSpan = TimeSpan.fromMilliseconds(0);
        socketService.socketClient.on('timerTick', (timeMs: number) => {
            this.timeSpan = TimeSpan.fromMilliseconds(timeMs);

            if (timeMs <= 0) {
                playerService.skipTurn();
            }
        });
    }

    get time(): TimeSpan {
        return this.timeSpan;
    }
}
