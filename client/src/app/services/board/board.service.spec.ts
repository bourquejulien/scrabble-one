/* eslint-disable max-classes-per-file -- Need more than one stub class */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BoardService } from '@app/services/board/board.service';

describe('BoardService', () => {
    let service: BoardService;
    // eslint-disable-next-line no-unused-vars
    // let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });

        service = TestBed.inject(BoardService);

        // httpMock = TestBed.inject(HttpTestingController);

        // const request = httpMock.expectOne(...);
        // expect(request.request.method).toBe('GET');
        // request.flush(...);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
