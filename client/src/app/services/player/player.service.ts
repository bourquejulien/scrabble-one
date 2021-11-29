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

    async placeLetters(word: string, position: Vec2, direction: Direction): Promise<void> {
        const positionToPlace = this.boardService.retrievePlacements(word, position, direction);
        return this.httpClient.post<void>(localUrl('place', this.sessionService.id), positionToPlace).toPromise();
    }

    async exchangeLetters(lettersToExchange: string): Promise<void> {
        const letterArray = lettersToExchange.split('');
        return this.httpClient.post<void>(localUrl('exchange', this.sessionService.id), letterArray).toPromise();
    }

    async skipTurn(): Promise<void> {
        return this.httpClient.post<void>(localUrl('skip', this.sessionService.id), this.sessionService.id).toPromise();
    }

    reset(): void {
        this.boardService.reset();
        this.reserveService.reset();
    }
}
