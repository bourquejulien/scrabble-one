import { Injectable } from '@angular/core';
import { BoardData, Bonus, Direction, Placement, Square, Vec2, Answer } from '@common';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '@app/services/session/session.service';
import { Constants } from '@app/constants/global.constants';
import { environmentExt } from '@environment-ext';

const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}board/${call}/${id}`;

@Injectable({
    providedIn: 'root',
})
export class BoardService {
    private boardData: BoardData;

    constructor(private readonly httpClient: HttpClient, private readonly sessionService: SessionService) {
        this.reset();
    }

    get gameBoard(): BoardData {
        return this.boardData;
    }

    async placeLetters(letters: Placement[]): Promise<Answer> {
        const response = await this.httpClient.post(localUrl('place', this.sessionService.id), letters).toPromise();
        let answer: Answer;

        try {
            answer = response as Answer;
        } catch (e) {
            return { isSuccess: false, body: '' };
        }

        return answer;
    }

    async refresh(): Promise<BoardData | null> {
        const response = await this.httpClient.get(localUrl('retrieve', this.sessionService.id)).toPromise();

        try {
            this.boardData = response as BoardData;
        } catch (e) {
            return null;
        }

        return this.boardData;
    }

    retrievePlacements(word: string, initialPosition: Vec2, direction: Direction): Placement[] {
        const increment = direction === Direction.Right ? { x: 1, y: 0 } : { x: 0, y: 1 };
        const placements: Placement[] = [];

        const position = initialPosition;

        for (const letter of word) {
            placements.push({ letter, position: { ...position } });
            position.x += increment.x;
            position.y += increment.y;
        }

        return placements;
    }

    reset(): void {
        const boardData: BoardData = { board: [], filledPositions: [] };

        for (let x = 0; x < Constants.GRID.GRID_SIZE; x++) {
            const column: Square[] = [];

            for (let y = 0; y < Constants.GRID.GRID_SIZE; y++) {
                column.push({ letter: '', bonus: Bonus.None, position: { x, y } });
            }

            boardData.board.push(column);
        }

        this.boardData = boardData;
    }
}
