import { Injectable } from '@angular/core';
import { Constants } from '@app/constants/global.constants';
import { BoardData, Bonus, Direction, Placement, Square, Vec2 } from '@common';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BoardService {
    private boardData: BoardData;
    private readonly boardSubject: BehaviorSubject<BoardData>;

    constructor(private readonly socketService: SocketClientService) {
        this.reset();
        this.socketService.on('board', (boardData: BoardData) => this.refresh(boardData));
        this.boardSubject = new BehaviorSubject<BoardData>(this.boardData);
    }

    get gameBoard(): BoardData {
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

    isPositionAvailable(position: Vec2): boolean {
        if (position.x === this.boardData.board.length + 1 || position.y === this.boardData.board.length + 1) {
            return true;
        }
        const letter: string = this.boardData.board[position.x - 1][position.y - 1].letter;
        return letter === '';
    }

    getLetter(position: Vec2): string {
        return this.boardData.board[position.x - 1][position.y - 1].letter;
    }

    get boardUpdated(): Observable<BoardData> {
        return this.boardSubject.asObservable();
    }

    private refresh(boardData: BoardData): void {
        this.boardData = boardData;
        this.boardSubject.next(boardData);
    }
}
