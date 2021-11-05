/* eslint-disable dot-notation -- reserve is private and we need access for the test */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { SessionService } from '@app/services/session/session.service';
import { environmentExt } from '@environment-ext';

class SessionServiceStub {
    private _id: string = '1';
    get id(): string {
        return this._id;
    }
}

describe('ReserveService', () => {
    let service: ReserveService;
    let httpMock: HttpTestingController;
    let sessionId: string;
    const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}reserve/${call}/${id}`;

    beforeEach(() => {
        sessionId = '1';

        TestBed.configureTestingModule({
            providers: [{ provide: SessionService, useClass: SessionServiceStub }],
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(ReserveService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should refresh reserve if refresh function called', fakeAsync(() => {
        const response = ['a', 'b', 'c'];
        service['reserve'] = ['z', 'y', 'x'];
        const firstLetter = service['reserve'][0];

        service.refresh();
        const request = httpMock.match(localUrl('retrieve', `${sessionId}`));
        request[0].flush(response);
        tick();

        expect(firstLetter).not.toBe(service['reserve'][0]);
        expect(service['reserve'][0]).toBe('a');
    }));

    it('should return letter quantity if valid letter', () => {
        const firstletterAndQuantity = 'A : 3';
        const secondLetterAndQuantity = 'B : 2';
        const letterNotFound = 'Z : 0';
        service['reserve'] = ['a', 'a', 'a', 'b', 'b', 'c'];
        expect(service.getLetterAndQuantity('a')).toBe(firstletterAndQuantity);
        expect(service.getLetterAndQuantity('b')).toBe(secondLetterAndQuantity);
        expect(service.getLetterAndQuantity('z')).toBe(letterNotFound);
    });

    it('should return reserve length', () => {
        expect(service.length).toBe(service['reserve'].length);
    });

    it('should empty reserve when reset is called', () => {
        service['reserve'] = ['a', 'a', 'a', 'b', 'b', 'c'];
        service.reset();
        expect(service.length).toBe(0);
    });
});
