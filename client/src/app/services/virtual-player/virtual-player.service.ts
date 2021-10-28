import { Injectable } from '@angular/core';
import { Timer } from '@app/classes/time/timer';
import { TimeSpan } from '@app/classes/time/timespan';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment';
import { SessionService } from '@app/services/session/session.service';
import { PlayerData } from '@app/classes/player-data';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { BoardService } from '@app/services/board/board.service';
import { PlayerType } from '@app/classes/player/player-type';

const MIN_PLAYTIME_SECONDS = 3;

// TODO To remove once the server is master over the client
// DO NOT TEST!!
@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerService {
    turnComplete: Subject<PlayerType>;
    playerData: PlayerData;
    private minTimer: Timer;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly sessionService: SessionService,
        private readonly reserveService: ReserveService,
        private readonly boardService: BoardService,
    ) {
        this.playerData = { score: 0, skippedTurns: 0, rack: [] };
        this.turnComplete = new Subject<PlayerType>();
        this.minTimer = new Timer();
    }

    // TODO To remove once the server is master over the client
    // DO NOT TEST!!
    async startTurn(playTime: TimeSpan) {
        this.minTimer.start(TimeSpan.fromSeconds(MIN_PLAYTIME_SECONDS));

        this.playerData = await this.httpClient
            .post<PlayerData>(`${environment.serverUrl}api/player/virtual`, { id: this.sessionService.id })
            .toPromise();
        await this.reserveService.refresh();
        await this.boardService.refresh();
        await this.minTimer.completed;

        this.endTurn();
    }

    endTurn() {
        this.minTimer.stop();
        this.turnComplete.next(PlayerType.Virtual);
    }

    reset(): void {
        this.playerData = { score: 0, skippedTurns: 0, rack: [] };
        this.minTimer.stop();
    }
}
