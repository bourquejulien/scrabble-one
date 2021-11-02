import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BoardService } from '@app/services/board/board.service';
import { RackService } from '@app/services/rack/rack.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { SessionService } from '@app/services/session/session.service';
import { Answer, Direction, Vec2 } from '@common';
import { environmentExt } from '@environmentExt';

const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}player/${call}/${id}`;

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    constructor(
        private readonly reserveService: ReserveService,
        private readonly boardService: BoardService,
        private readonly rackService: RackService,
        private readonly sessionService: SessionService,
        private readonly httpClient: HttpClient,
    ) {}

    async placeLetters(word: string, position: Vec2, direction: Direction): Promise<boolean> {
        const positionToPlace = this.boardService.retrievePlacements(word, position, direction);
        const validationData = await this.boardService.lookupLetters(positionToPlace);

        if (!validationData.isSuccess) {
            return false;
        }

        const answer = await this.boardService.placeLetters(positionToPlace);

        if (!answer.isSuccess) {
            return false;
        }

        await this.refresh();
        return true;
    }

    async exchangeLetters(lettersToExchange: string): Promise<boolean> {
        const letterArray = lettersToExchange.split('');
        const answer = await this.httpClient.post<Answer>(localUrl('exchange', this.sessionService.id), letterArray).toPromise();

        if (!answer.isSuccess) {
            return false;
        }

        await this.refresh();
        return true;
    }

    async skipTurn(): Promise<boolean> {
        const answer = await this.httpClient.post<Answer>(localUrl('skip', this.sessionService.id), this.sessionService.id).toPromise();

        if (!answer.isSuccess) {
            return false;
        }

        await this.refresh();
        return true;
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
