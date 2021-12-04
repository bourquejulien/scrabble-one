/* eslint-disable max-classes-per-file -- Need more than one stub class */
/* eslint-disable dot-notation -- Need access to private functions and properties*/
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';
import { SessionService } from '@app/services/session/session.service';
import { BoardData, Bonus, Direction, Vec2 } from '@common';

const BONUSES = [
    { bonus: Bonus.L2, position: { x: 0, y: 0 } },
    { bonus: Bonus.L3, position: { x: 0, y: 1 } },
    { bonus: Bonus.W2, position: { x: 0, y: 2 } },
    { bonus: Bonus.W3, position: { x: 0, y: 3 } },
    { bonus: Bonus.Star, position: { x: 7, y: 7 } },
];

const generateData = (size: number): BoardData => {
    const data: BoardData = { board: [], filledPositions: [] };

    for (let x = 0; x < size; x++) {
        data.board[x] = [];
        for (let y = 0; y < size; y++) {
            const bonus = BONUSES.find((e) => e.position.x === x && e.position.y === y)?.bonus ?? Bonus.None;
            data.board[x][y] = { position: { x, y }, letter: bonus === Bonus.None ? 'a' : '', bonus };
        }
    }

    return data;
};

@Injectable({
    providedIn: 'root',
})
class SessionServiceStub {
    private _id: string = '1';
    get id(): string {
        return this._id;
    }
}

describe('BoardService', () => {
    let service: BoardService;
    let position: Vec2;
    let data: BoardData;
    let httpMock: HttpTestingController;
    const session = new SessionService();

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: SessionService, useClass: SessionServiceStub }],
            imports: [HttpClientTestingModule],
        });

        service = TestBed.inject(BoardService);
        httpMock = TestBed.inject(HttpTestingController);
        session['_id'] = '1';
        position = { x: 2, y: 2 };
        data = generateData(Constants.GRID.GRID_SIZE);
        service['boardData'] = data;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return board data', () => {
        expect(service.gameBoard).toEqual(data);
    });

    it('should refresh board', fakeAsync(() => {
        const BOARD_DATA: BoardData = {
            board: [],
            filledPositions: [],
        };

        let isFirstCall = true;

        service.boardUpdated.subscribe((boardData) => {
            if (isFirstCall) {
                isFirstCall = false;
            } else {
                expect(boardData).toEqual(BOARD_DATA);
            }
        });

        service['refresh'](BOARD_DATA);
    }));

    it('should retrieve placements of letters to place in word', () => {
        const word = 'Bofa';
        const placement = service.retrievePlacements(word, { x: 0, y: 0 }, Direction.Down);
        expect(placement.length).toBe(word.length);
    });

    it('should not retrieve any placements if not word passed', () => {
        const word = '';
        const placement = service.retrievePlacements(word, { x: 0, y: 0 }, Direction.Down);
        expect(placement.length).toBe(word.length);
    });

    it('should increase position of placements leftward if direction of placement is right', () => {
        const word = 'Yeet';
        const placement = service.retrievePlacements(word, { x: 0, y: 0 }, Direction.Right);
        const expectedPlacement = [
            { letter: 'Y', position: { x: 0, y: 0 } },
            { letter: 'e', position: { x: 1, y: 0 } },
            { letter: 'e', position: { x: 2, y: 0 } },
            { letter: 't', position: { x: 3, y: 0 } },
        ];

        expect(placement).toEqual(expectedPlacement);
    });

    it('should increase position of placements downward by default', () => {
        const word = 'Tree';
        const placement = service.retrievePlacements(word, { x: 0, y: 0 }, Direction.Down);
        const expectedPlacement = [
            { letter: 'T', position: { x: 0, y: 0 } },
            { letter: 'r', position: { x: 0, y: 1 } },
            { letter: 'e', position: { x: 0, y: 2 } },
            { letter: 'e', position: { x: 0, y: 3 } },
        ];

        expect(placement).toEqual(expectedPlacement);
    });

    it('should return true if position available', () => {
        service['boardData'].board[position.x - 1][position.y - 1].letter = '';
        expect(service.isPositionAvailable(position)).toBe(true);
    });

    it('should return false if position occupied', () => {
        service['boardData'].board[position.x - 1][position.y - 1].letter = 'a';
        expect(service.isPositionAvailable(position)).toBe(false);
    });

    it('should return true if surrounding positions available', () => {
        const testPosition = { x: Constants.GRID.GRID_SIZE + 1, y: Constants.GRID.GRID_SIZE + 1 };
        expect(service.isPositionAvailable(testPosition)).toBe(true);
    });

    it('should get correct letter on board at specified position', () => {
        service['boardData'].board[position.x - 1][position.y - 1].letter = 'a';
        expect(service.getLetter(position)).toBe('a');
    });
});
