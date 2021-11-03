import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { environmentExt } from '@environmentExt';
import { SessionService } from '../session/session.service';
import { RackService } from './rack.service';

@Injectable({
    providedIn: 'root',
})
class SessionServiceStub {
    private _id: string = '1';
    get id(): string {
        return this._id;
    }
}

const LETTERS = ['a', 'b', 'c', 'd'];

describe('RackService', () => {
    let service: RackService;
    let httpMock: HttpTestingController;
    let sessionId: string;
    const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}player/${call}/${id}`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: SessionService, useClass: SessionServiceStub }],
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(RackService);
        httpMock = TestBed.inject(HttpTestingController);

        service.rack.push(...LETTERS);
        sessionId = '1';
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should swap left', () => {
        service.swapLeft(0);
        expect(service.rack).toEqual(['b', 'c', 'd', 'a']);

        service.swapLeft(service.length - 1);
        expect(service.rack).toEqual(['b', 'c', 'a', 'd']);
    });

    it('should swap right', () => {
        service.swapRight(service.length - 1);
        expect(service.rack).toEqual(['d', 'a', 'b', 'c']);

        service.swapRight(0);
        expect(service.rack).toEqual(['a', 'd', 'b', 'c']);
    });

    it('should return indexOf', () => {
        const POSITION = 2;
        const OVERFLOW_POSITION = 5;

        service.indexOf(LETTERS[POSITION]);
        expect(service.indexOf(LETTERS[POSITION])).toEqual(POSITION);

        service.indexOf(LETTERS[POSITION], 1);
        expect(service.indexOf(LETTERS[POSITION])).toEqual(POSITION);

        service.indexOf(LETTERS[POSITION], 2 + LETTERS.length);
        expect(service.indexOf(LETTERS[POSITION])).toEqual(POSITION);

        service.indexOf(LETTERS[OVERFLOW_POSITION]);
        expect(service.indexOf(LETTERS[OVERFLOW_POSITION])).toEqual(-1);
    });

    it('should refresh payer data if turn skipped', fakeAsync(() => {
        const rack = ['a', 'a', 'b', 'c'];
        const spy = spyOn(service, 'refresh');
        const firstLetterInRack = service.rack[0];
        service.refresh();
        const request = httpMock.match(localUrl('rack', `${sessionId}`));

        request[0].flush(rack);
        tick();

        expect(spy).toHaveBeenCalled();
        expect(firstLetterInRack).not.toBe(service.rack[0]);
    }));

    it('should empty', () => {
        service.empty();
        expect(service.length).toEqual(0);
    });
});
