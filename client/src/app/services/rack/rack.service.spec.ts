/* eslint-disable dot-notation -- Need access to private functions and properties*/
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { RackService } from '@app/services/rack/rack.service';
import { SessionService } from '@app/services/session/session.service';

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

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: SessionService, useClass: SessionServiceStub }],
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(RackService);
        httpMock = TestBed.inject(HttpTestingController);

        service.rack.push(...LETTERS);
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

    it('should refresh rack if refresh function called', fakeAsync(() => {
        // const rack = ['a', 'a', 'b', 'c'];
        // service['rack'] = ['z', 'y'];
        // const firstLetterInRack = service['rack'][0];
        //
        // service.refresh();
        // const request = httpMock.match(localUrl('rack', `${sessionId}`));
        // request[0].flush(rack);
        // tick();
        //
        // expect(firstLetterInRack).not.toBe(service['rack'][0]);
        // expect(service.rack[0]).toBe('a');
    }));

    it('should return error if trying to swap letters in empty rack', () => {
        service['rack'] = [];
        const value = service['swap'](2, 3);
        expect(value).toBe(-1);
    });

    it('should return modulo of entered number', () => {
        service['rack'] = ['a', 'b', 'c', 'd', 'e'];
        expect(service.mod(10)).toBe(0);
    });

    it('should only keep valid letters in rack if invalid symbols pushed', () => {
        service['rack'] = ['a', '', '', 'd', 'e'];
        const initLength = service['rack'].length;
        const newLength = 3;
        service['refresh'](service['rack']);
        expect(service['rack'].length).not.toBe(initLength);
        expect(service['rack'].length).toBe(newLength);
    });

    it('should empty', () => {
        service.reset();
        expect(service.length).toEqual(0);
    });
});
