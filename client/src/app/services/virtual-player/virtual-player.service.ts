import { Injectable } from '@angular/core';
import { PlayerType } from '@common';
import { Timer } from '@app/classes/time/timer';
import { TimeSpan } from '@app/classes/time/timespan';
import { TimerService } from '@app/services/timer/timer.service';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment';
import { SessionService } from '@app/services/session/session.service';
import { PlayerData } from '@app/classes/player-data';

const MIN_PLAYTIME_SECONDS = 3;

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerService {
    turnComplete: Subject<PlayerType>;
    playerData: PlayerData;
    private minTimer: Timer;

    constructor(
        private readonly timerService: TimerService,
        private readonly httpClient: HttpClient,
        private readonly sessionService: SessionService,
    ) {
        this.playerData = { score: 0, skippedTurns: 0, rack: [] };
        this.turnComplete = new Subject<PlayerType>();
        this.minTimer = new Timer();
    }

    async startTurn(playTime: TimeSpan) {
        this.timerService.start(playTime, PlayerType.Virtual);
        this.minTimer.start(TimeSpan.fromSeconds(MIN_PLAYTIME_SECONDS));

        await this.httpClient.post(`${environment.serverUrl}/game/virtual`, { id: this.sessionService.id });
        await this.minTimer.completed;

        this.endTurn();
    }

    endTurn() {
        this.minTimer.stop();
        this.timerService.stop();
        this.turnComplete.next(PlayerType.Virtual);
    }

    reset(): void {
        this.playerData = { score: 0, skippedTurns: 0, rack: [] };
        this.minTimer.stop();
    }
}
