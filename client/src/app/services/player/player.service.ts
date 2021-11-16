import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BoardService } from '@app/services/board/board.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { SessionService } from '@app/services/session/session.service';
import { Answer, Direction, Vec2 } from '@common';
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

    async placeLetters(word: string, position: Vec2, direction: Direction): Promise<boolean> {
        const positionToPlace = this.boardService.retrievePlacements(word, position, direction);

        try {
            const answer = await this.httpClient.post<Answer>(localUrl('place', this.sessionService.id), positionToPlace).toPromise();
            return answer.isSuccess;
        } catch (err) {
            return false;
        }
    }

    async exchangeLetters(lettersToExchange: string): Promise<boolean> {
        const letterArray = lettersToExchange.split('');
        const answer = await this.httpClient.post<Answer>(localUrl('exchange', this.sessionService.id), letterArray).toPromise();

        return answer.isSuccess;
    }

    async skipTurn(): Promise<boolean> {
        const answer = await this.httpClient.post<Answer>(localUrl('skip', this.sessionService.id), this.sessionService.id).toPromise();
        return answer.isSuccess;
    }

    reset(): void {
        this.boardService.reset();
        this.reserveService.reset();
    }
}
