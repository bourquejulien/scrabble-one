// /* eslint-disable max-classes-per-file -- Need more than one stub class */
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { fakeAsync, TestBed, tick } from '@angular/core/testing';
// import { BoardService } from '@app/services/board/board.service';
// import { Bonus } from '@common';
// import { environmentExt } from '@environmentExt';

// describe('BoardService', () => {
//     let service: BoardService;
//     // eslint-disable-next-line no-unused-vars
//     let httpMock: HttpTestingController;
//     const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}board/${call}/${id}`;

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             imports: [HttpClientTestingModule],
//         });

//         service = TestBed.inject(BoardService);

//         httpMock = TestBed.inject(HttpTestingController);

//         // const request = httpMock.expectOne(...);
//         // expect(request.request.method).toBe('GET');
//         // request.flush(...);
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     it('should return board data', () => {
//         const spy = spyOnProperty(service, 'gameBoard', 'get').and.returnValue({ letter: 'a', bonus: Bonus.L2, position: { x: 0, y: 0 }, filledPosition: { x: 0, y: 0 } });
//         expect(spy).toHaveBeenCalled();
//     });

//     it('should call POST request with http client when exchanging', fakeAsync(() => {
//         letters: Placement;
//         service.placeLetters(lettersToExchange);
//         const request = httpMock.match(localUrl('exchange', `${sessionId}`));

//         expect(request[0].request.method).toEqual('POST');

//         request[0].flush([]);
//         tick();
//     }));
// });
