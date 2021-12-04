import { TestBed } from '@angular/core/testing';

import { HealthService } from './health.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '@environment';

const LOCAL_URL = `${environment.serverUrl}status`;

describe('HealthService', () => {
    let service: HealthService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(HealthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be ok', (done) => {
        service
            .isServerOk()
            .then(() => done())
            .catch((err) => {
                done.fail(err);
            });

        const request = httpMock.expectOne(LOCAL_URL);
        expect(request.request.body).toBe(null);
        request.flush('ok');
    });
});
