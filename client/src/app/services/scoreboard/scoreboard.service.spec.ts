import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Score } from '@common';
import { environmentExt } from '@environment-ext';
import { ScoreboardService } from './scoreboard.service';

describe('ScoreboardService', () => {
    let service: ScoreboardService;
    let httpMock: HttpTestingController;

    const localUrl = (call: string) => `${environmentExt.apiUrl}score/${call}`;
    const DATABASE_COLLECTION_CLASSIC = 'classicScoreboard';
    const DATABASE_COLLECTION_LOG = 'logScoreboard';

    const classicScore: Score[] = [
        { name: 'Albert', scoreValue: 10 },
        { name: 'Tristan', scoreValue: 15 },
    ];

    const logScore: Score[] = [
        { name: 'Bruce', scoreValue: 20 },
        { name: 'Wayne', scoreValue: 25 },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(ScoreboardService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should GET classic scoreboard from server', fakeAsync(() => {
        service.displayScores(DATABASE_COLLECTION_CLASSIC);
        const request = httpMock.match(localUrl(DATABASE_COLLECTION_CLASSIC));

        expect(request[0].request.method).toEqual('GET');
        request[0].flush([]);
    }));

    it('should GET log scoreboard from server', fakeAsync(() => {
        service.displayScores(DATABASE_COLLECTION_LOG);
        const request = httpMock.match(localUrl(DATABASE_COLLECTION_LOG));

        expect(request[0].request.method).toEqual('GET');
        request[0].flush([]);
    }));

    it('should retrieve classic scoreboard from server', fakeAsync(() => {
        service.displayScores(DATABASE_COLLECTION_CLASSIC).then((scores) => {
            expect(scores).toEqual(classicScore);
        });

        const request = httpMock.match(localUrl(DATABASE_COLLECTION_CLASSIC));
        request[0].flush(classicScore);
    }));

    it('should retrieve log scoreboard from server', fakeAsync(() => {
        service.displayScores(DATABASE_COLLECTION_LOG).then((scores) => {
            expect(scores).toEqual(logScore);
        });

        const request = httpMock.match(localUrl(DATABASE_COLLECTION_LOG));
        request[0].flush(logScore);
    }));
});
