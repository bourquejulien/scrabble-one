import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BoardService } from '@app/services/board/board.service';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { RackService } from '@app/services/rack/rack.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { SessionService } from '@app/services/session/session.service';
import { Answer, Direction, MessageType, Vec2 } from '@common';
import { environmentExt } from '@environmentExt';

const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}player/${call}/${id}`;

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    constructor(
        private readonly reserveService: ReserveService,
        private readonly boardService: BoardService,
        private readonly messagingService: MessagingService,
        private readonly rackService: RackService,
        private readonly sessionService: SessionService,
        private readonly httpClient: HttpClient,
    ) {}

    async placeLetters(word: string, position: Vec2, direction: Direction): Promise<void> {
        const positionToPlace = this.boardService.retrievePlacements(word, position, direction);
        const validationData = await this.boardService.lookupLetters(positionToPlace);

        if (!validationData.isSuccess) {
            this.messagingService.send('', validationData.description, MessageType.Log);
            return;
        }

        const answer = await this.boardService.placeLetters(positionToPlace);

        if (!answer.isSuccess) {
            this.messagingService.send('', answer.body, MessageType.Error);
            return;
        }

        await this.refresh();
    }

    async exchangeLetters(lettersToExchange: string): Promise<void> {
        const letterArray = lettersToExchange.split('');
        const answer = await this.httpClient.post<Answer>(localUrl('exchange', this.sessionService.id), letterArray).toPromise();

        if (!answer.isSuccess) {
            this.messagingService.send('', answer.body, MessageType.Error);
            return;
        }

        await this.refresh();
    }

    async skipTurn(): Promise<void> {
        const answer = await this.httpClient.post<Answer>(localUrl('skip', this.sessionService.id), this.sessionService.id).toPromise();

        if (!answer.isSuccess) {
            this.messagingService.send('', answer.body, MessageType.Error);
            return;
        }

        await this.refresh();
    }

    async refresh(): Promise<void> {
        await this.reserveService.refresh();
        await this.boardService.refresh();
        await this.rackService.refresh();
    }

    reset(): void {
        this.boardService.reset();
        this.reserveService.reset();
    }

    get rack(): string[] {
        return this.rackService.rack;
    }
}
