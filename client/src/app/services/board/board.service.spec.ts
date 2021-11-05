/* eslint-disable max-classes-per-file -- Need more than one stub class */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';
import { BoardData, Bonus, Direction, Placement } from '@common';
import { environmentExt } from '@environment-ext';
import { SessionService } from '../session/session.service';

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

const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}board/${call}/${id}`;

describe('BoardService', () => {
    let service: BoardService;
    let letters: Placement[];
    // eslint-disable-next-line no-unused-vars
    let httpMock: HttpTestingController;
    const session = new SessionService();

    //const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}board/${call}/${id}`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: SessionService, useClass: SessionServiceStub },
            ],
            imports: [HttpClientTestingModule],
        });

        service = TestBed.inject(BoardService);
        letters = [{ letter: 'a', position: { x: 1, y: 1 } }];
        httpMock = TestBed.inject(HttpTestingController);
    });


    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return board data', () => {
        let data = generateData(Constants.GRID.GRID_SIZE);
        service['boardData'] = data;
        expect(service.gameBoard).toEqual(data);
    });

    it('should call POST request with http client when trying to place letter', fakeAsync(() => {
        session['_id'] = '1';
        service.placeLetters(letters);

        const request = httpMock.match(localUrl('place', `${session.id}`));
        request[0].flush([]);

        expect(request[0].request.method).toEqual('POST');
        tick();
    }));

    it('should call GET request with http client refreshing board data', fakeAsync(() => {
        session['_id'] = '1';
        service.refresh();
        const request = httpMock.match(localUrl('retrieve', `${session.id}`));
        request[0].flush([]);
        tick();


        expect(request[0].request.method).toEqual('GET');
    }));

    // it('should refresh board data with data received from server', fakeAsync(() => {
    //     let dataBefore = generateData(Constants.GRID.GRID_SIZE);
    //     let dataAfter = generateData(Constants.GRID.GRID_SIZE * 2);
    //     let promisedDataAfter = Promise.resolve(dataAfter);
    //     service['boardData'] = dataBefore;

    //     let boardData = service.refresh();
    //     const request = httpMock.match(localUrl('retrieve', `${session.id}`));

    //     expect(request[0].request.method).toEqual('GET');

    //     request[0].flush(promisedDataAfter);
    //     tick();

    //     expect(boardData).toEqual(promisedDataAfter);
    // }));

    it('should retrieve placements of letters to place in word', () => {
        //session['_id'] = '2';
        let word = 'Bofa';
        //const spy = spyOn<any>(Array.prototype, 'push');
        let placement = service.retrievePlacements(word, { x: 0, y: 0 }, Direction.Down);
        expect(placement.length).toBe(word.length);
    });
});
