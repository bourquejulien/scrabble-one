import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BoardService } from '@app/services/board/board.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { SessionService } from '@app/services/session/session.service';
import { Direction, Vec2 } from '@common';
import { environmentExt } from '@environment-ext';

const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}player/${call}/${id}`;

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    constructor(
        private reserveService: ReserveService,
        private boardService: BoardService,
        private sessionService: SessionService,
        private httpClient: HttpClient,
    ) {}

    placeLetters(word: string, position: Vec2, direction: Direction): void {
        const positionToPlace = this.boardService.retrievePlacements(word, position, direction);
        this.httpClient.post(localUrl('place', this.sessionService.id), positionToPlace);
    }

    exchangeLetters(lettersToExchange: string): void {
        const letterArray = lettersToExchange.split('');
        this.httpClient.post(localUrl('exchange', this.sessionService.id), letterArray);
    }

    skipTurn(): void {
        this.httpClient.post(localUrl('skip', this.sessionService.id), this.sessionService.id);
    }

    reset(): void {
        this.boardService.reset();
        this.reserveService.reset();
    }
}
