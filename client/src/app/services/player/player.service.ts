import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PlayerData } from '@app/classes/player-data';
import { PlayerType } from '@app/classes/player/player-type';
import { TimeSpan } from '@app/classes/time/timespan';
import { BoardService } from '@app/services/board/board.service';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { RackService } from '@app/services/rack/rack.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { SessionService } from '@app/services/session/session.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Answer, Direction, MessageType, Vec2 } from '@common';
import { environmentExt } from '@environmentExt';
import { Subject } from 'rxjs';

const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}player/${call}/${id}`;

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
            if (PlayerType.Local === playerType) this.completeTurn();
        });
    }

    startTurn(playTime: TimeSpan): void {
        this.timerService.start(playTime, PlayerType.Local);
    }

    async placeLetters(word: string, position: Vec2, direction: Direction): Promise<void> {
        const positionToPlace = this.boardService.retrievePlacements(word, position, direction);
        const validationData = await this.boardService.lookupLetters(positionToPlace);

        if (!validationData.isSuccess) {
            this.messagingService.send('', validationData.description, MessageType.Log);
            this.completeTurn();
            return;
        }

        const answer = await this.boardService.placeLetters(positionToPlace);

        if (!answer.isSuccess) {
            this.messagingService.send('', answer.body, MessageType.Error);
            return;
        }

        await this.refresh();
        this.completeTurn();
    }

    async exchangeLetters(lettersToExchange: string): Promise<void> {
        const letterArray = lettersToExchange.split('');
        const answer = await this.httpClient.post<Answer>(localUrl('exchange', this.sessionService.id), letterArray).toPromise();

        if (!answer.isSuccess) {
            this.messagingService.send('', answer.body, MessageType.Error);
            return;
        }

        await this.refresh();

        this.completeTurn();
    }

    async skipTurn(): Promise<void> {
        const answer = await this.httpClient.post<Answer>(localUrl('skip', this.sessionService.id), this.sessionService.id).toPromise();

        if (!answer.isSuccess) {
            this.messagingService.send('', answer.body, MessageType.Error);
            return;
        }

        await this.refresh();
        this.completeTurn();
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
        this.boardService.reset();
        this.reserveService.reset();
    }

    get rackLength(): number {
        return this.rackService.length;
    }

    get rack(): string[] {
        return this.rackService.rack;
    }

    private completeTurn(): void {
        this.turnComplete.next(PlayerType.Local);
    }

    private updateRack(playerData: PlayerData): void {
        this.playerData = playerData;
        this.rackService.update(this.playerData.rack);
    }
}
