import { Injectable } from '@angular/core';
import { PlayerData } from '@app/classes/player-data';
import { TimeSpan } from '@app/classes/time/timespan';
import { MessageType, PlayerType, Vec2, Direction } from '@common';
import { BoardService } from '@app/services/board/board.service';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Subject } from 'rxjs';
import { RackService } from '@app/services/rack/rack.service';
import { environment } from '@environment';
import { SessionService } from '@app/services/session/session.service';
import { HttpClient } from '@angular/common/http';

const localUrl = (call: string, id: string) => `${environment.serverUrl}api/player/${call}/${id}`;

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    turnComplete: Subject<PlayerType>;

    // TODO Should be replaced by stats once server-side events are used
    // TODO Rack could be update by ReserveService
    playerData: PlayerData = {
        score: 0,
        skippedTurns: 0,
        rack: [],
    };

    constructor(
        private readonly reserveService: ReserveService,
        private readonly boardService: BoardService,
        private readonly timerService: TimerService,
        private readonly messagingService: MessagingService,
        private readonly rackService: RackService,
        private readonly sessionService: SessionService,
        private readonly httpClient: HttpClient,
    ) {
        this.turnComplete = new Subject<PlayerType>();
        this.timerService.countdownStopped.subscribe((playerType) => {
            if (PlayerType.Human === playerType) this.completeTurn();
        });
    }

    startTurn(playTime: TimeSpan): void {
        this.timerService.start(playTime, PlayerType.Human);
    }

    async placeLetters(word: string, position: Vec2, direction: Direction): Promise<void> {
        const positionToPlace = this.boardService.retrievePlacements(word, position, direction);
        const validationData = await this.boardService.lookupLetters(positionToPlace);

        if (!validationData.isSuccess) {
            this.messagingService.send('', validationData.description, MessageType.Log);
            this.completeTurn();
            return;
        }

        await this.boardService.placeLetters(positionToPlace);
        await this.refresh();

        this.completeTurn();
    }

    async exchangeLetters(lettersToExchange: string): Promise<void> {
        const letterArray = lettersToExchange.split('');
        console.log(letterArray);
        const playerData = await this.httpClient.post<PlayerData>(localUrl('exchange', this.sessionService.id), letterArray).toPromise();

        this.updateRack(playerData);
        await this.reserveService.refresh();

        this.completeTurn();
    }

    async skipTurn(): Promise<void> {
        const playerData = await this.httpClient.post<PlayerData>(localUrl('skip', this.sessionService.id), this.sessionService.id).toPromise();
        this.updateRack(playerData);

        this.completeTurn();
    }

    completeTurn(): void {
        this.turnComplete.next(PlayerType.Human);
    }

    async refresh(): Promise<void> {
        const response = await this.httpClient.get(localUrl('retrieve', this.sessionService.id)).toPromise();

        this.updateRack(response as PlayerData);
        await this.reserveService.refresh();
        await this.boardService.refresh();
    }

    reset(): void {
        this.playerData.skippedTurns = 0;
        this.playerData.score = 0;
        this.timerService.stop();
    }

    get rackLength(): number {
        return this.rackService.length;
    }

    get rack(): string[] {
        return this.rackService.rack;
    }

    private updateRack(playerData: PlayerData): void {
        this.playerData = playerData;
        this.rackService.update(this.playerData.rack);
    }
}
