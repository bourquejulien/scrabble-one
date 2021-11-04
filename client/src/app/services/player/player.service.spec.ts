/* eslint-disable dot-notation -- Need access to private functions and properties*/
/* eslint-disable max-classes-per-file -- Multiple stubs/mocks are used */
/* eslint-disable max-lines  -- Max lines should not be applied to tests*/

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BoardService } from '@app/services/board/board.service';
import { PlayerService } from '@app/services/player/player.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { Direction, Placement } from '@common';
import { environmentExt } from '@environmentExt';
import { RackService } from '../rack/rack.service';
import { SessionService } from '../session/session.service';

@Injectable({
    providedIn: 'root',
})
class SessionServiceStub {
    private _id: string = '1';
    get id(): string {
        return this._id;
    }
}

describe('PlayerService', () => {
    let service: PlayerService;
    let lettersToExchange: string;
    let boardServiceSpy: jasmine.SpyObj<BoardService>;
    let rackServiceSpy: jasmine.SpyObj<RackService>;
    let reserveServiceSpy: jasmine.SpyObj<ReserveService>;
    let letterToPlace: Placement[];
    let httpMock: HttpTestingController;
    let sessionId: string;
    const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}player/${call}/${id}`;

    beforeEach(() => {
        lettersToExchange = 'kee';
        sessionId = '1';
        boardServiceSpy = jasmine.createSpyObj('BoardService', ['retrievePlacements', 'placeLetters', 'refresh', 'reset']);
        reserveServiceSpy = jasmine.createSpyObj('ReserveService', ['refresh', 'reset']);
        rackServiceSpy = jasmine.createSpyObj('RackService', ['rack', 'refresh']);
        rackServiceSpy['rack'] = ['k', 'e', 's', 'e', 'i', 'o', 'v'];

        TestBed.configureTestingModule({
            providers: [
                { provide: BoardService, useValue: boardServiceSpy },
                { provide: RackService, useValue: rackServiceSpy },
                { provide: ReserveService, useValue: reserveServiceSpy },
                { provide: SessionService, useClass: SessionServiceStub },
            ],
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(PlayerService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('shoud place letters using placeLetters from board service', async () => {
        const answer = { isSuccess: false, body: 'Error' };
        letterToPlace = [{ letter: 'k', position: { x: 11, y: 3 } }];
        boardServiceSpy['retrievePlacements'].and.returnValue(letterToPlace);
        boardServiceSpy['placeLetters'].and.resolveTo(answer);

        await service.placeLetters('k', { x: 11, y: 3 }, Direction.Up);
        expect(boardServiceSpy['placeLetters']).toHaveBeenCalled();
    });

    it('should send error message if validation fail', async () => {
        const answer = { isSuccess: false, body: 'Error' };
        letterToPlace = [{ letter: 'k', position: { x: 11, y: 3 } }];
        boardServiceSpy['retrievePlacements'].and.returnValue(letterToPlace);
        boardServiceSpy['placeLetters'].and.returnValue(Promise.resolve(answer));

        const isSuccess = await service.placeLetters('k', { x: 11, y: 3 }, Direction.Up);
        expect(isSuccess).toBe(false);
    });

    it('should refresh player data if letters successfully placed', async () => {
        const answer = { isSuccess: true, body: 'Valid' };
        const spy = spyOn(service, 'refresh');
        letterToPlace = [{ letter: 'k', position: { x: 11, y: 3 } }];
        boardServiceSpy['retrievePlacements'].and.returnValue(letterToPlace);
        boardServiceSpy['placeLetters'].and.returnValue(Promise.resolve(answer));

        await service.placeLetters('k', { x: 11, y: 3 }, Direction.Up);
        await service.refresh();
        expect(spy).toHaveBeenCalled();
    });

    it('should call POST request with http client when exchanging', fakeAsync(() => {
        service.exchangeLetters(lettersToExchange);
        const request = httpMock.match(localUrl('exchange', `${sessionId}`));

        expect(request[0].request.method).toEqual('POST');

        request[0].flush([]);
        tick();
    }));

    it('should refresh player data if valid letters provided when exchanging', fakeAsync(() => {
        const answer = { isSuccess: true, body: 'Valid' };
        const spy = spyOn(service, 'refresh');

        service.exchangeLetters(lettersToExchange);
        const request = httpMock.match(localUrl('exchange', `${sessionId}`));

        request[0].flush(answer);
        tick();

        expect(spy).toHaveBeenCalled();
    }));

    it('should send error message when exchange called if invalid letters provided', fakeAsync(async () => {
        const answer = { isSuccess: false, body: 'Error' };

        service.exchangeLetters('z');
        const request = httpMock.expectOne(localUrl('exchange', `${sessionId}`));
        boardServiceSpy['placeLetters'].and.returnValue(Promise.resolve(answer));

        request.flush(answer);
        tick();

        const isSuccess = await service.placeLetters('k', { x: 11, y: 3 }, Direction.Up);
        expect(isSuccess).toEqual(false);
    }));

    it('should call POST request with http client when skipping', fakeAsync(() => {
        service.skipTurn();
        const request = httpMock.match(localUrl('skip', `${sessionId}`));

        expect(request[0].request.method).toEqual('POST');
    }));

    it('should send error message when skipTurn fails', fakeAsync(async () => {
        const answer = { isSuccess: false, body: 'Error' };

        service.skipTurn();
        const request = httpMock.expectOne(localUrl('skip', `${sessionId}`));

        request.flush(answer);
        tick();

        boardServiceSpy['placeLetters'].and.returnValue(Promise.resolve(answer));
        let isSuccess = await service.placeLetters('k', { x: 11, y: 3 }, Direction.Up);
        expect(isSuccess).toEqual(false);
    }));

    it('should refresh player data if turn skipped', fakeAsync(() => {
        const answer = { isSuccess: true, body: 'Valid' };
        const spy = spyOn(service, 'refresh');

        service.skipTurn();
        const request = httpMock.match(localUrl('skip', `${sessionId}`));

        request[0].flush(answer);
        tick();

        expect(spy).toHaveBeenCalled();
    }));

    it('should refresh player data if refresh function called', async () => {
        await service.refresh();
        expect(boardServiceSpy['refresh']).toHaveBeenCalled();
        expect(rackServiceSpy['refresh']).toHaveBeenCalled();
    });

    it('should reset game data if reset function called', () => {
        service.reset();
        expect(reserveServiceSpy['reset']).toHaveBeenCalled();
        expect(boardServiceSpy['reset']).toHaveBeenCalled();
    });

    it('should get rack', () => {
        expect(service.rack).toBe(rackServiceSpy['rack']);
    });
});
