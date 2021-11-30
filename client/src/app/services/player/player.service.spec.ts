// /* eslint-disable dot-notation -- Need access to private functions and properties*/
// /* eslint-disable max-classes-per-file -- Multiple stubs/mocks are used */
// /* eslint-disable max-lines  -- Max lines should not be applied to tests*/
//
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { Injectable } from '@angular/core';
// import { fakeAsync, TestBed } from '@angular/core/testing';
// import { BoardService } from '@app/services/board/board.service';
// import { PlayerService } from '@app/services/player/player.service';
// import { RackService } from '@app/services/rack/rack.service';
// import { ReserveService } from '@app/services/reserve/reserve.service';
// import { SessionService } from '@app/services/session/session.service';
// import { Direction, Placement } from '@common';
// import { environmentExt } from '@environment-ext';
//
// @Injectable({
//     providedIn: 'root',
// })
// class SessionServiceStub {
//     private _id: string = '1';
//     get id(): string {
//         return this._id;
//     }
// }
//
// describe('PlayerService', () => {
//     let service: PlayerService;
//     let lettersToExchange: string;
//     let boardServiceSpy: jasmine.SpyObj<BoardService>;
//     let rackServiceSpy: jasmine.SpyObj<RackService>;
//     let reserveServiceSpy: jasmine.SpyObj<ReserveService>;
//     let letterToPlace: Placement[];
//     let httpMock: HttpTestingController;
//     let sessionId: string;
//     const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}player/${call}/${id}`;
//
//     beforeEach(() => {
//         lettersToExchange = 'kee';
//         sessionId = '1';
//         boardServiceSpy = jasmine.createSpyObj('BoardService', ['retrievePlacements', 'placeLetters', 'refresh', 'reset']);
//         reserveServiceSpy = jasmine.createSpyObj('ReserveService', ['refresh', 'reset']);
//         rackServiceSpy = jasmine.createSpyObj('RackService', ['rack', 'refresh']);
//         rackServiceSpy['rack'] = ['k', 'e', 's', 'e', 'i', 'o', 'v'];
//
//         TestBed.configureTestingModule({
//             providers: [
//                 { provide: BoardService, useValue: boardServiceSpy },
//                 { provide: RackService, useValue: rackServiceSpy },
//                 { provide: ReserveService, useValue: reserveServiceSpy },
//                 { provide: SessionService, useClass: SessionServiceStub },
//             ],
//             imports: [HttpClientTestingModule],
//         });
//         service = TestBed.inject(PlayerService);
//         httpMock = TestBed.inject(HttpTestingController);
//     });
//
//     afterEach(() => {
//         httpMock.verify();
//     });
//
//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });
//
//     it('should return false if place call fails', async () => {
//         letterToPlace = [{ letter: 'k', position: { x: 11, y: 3 } }];
//         boardServiceSpy['retrievePlacements'].and.returnValue(letterToPlace);
//
//         service.placeLetters('k', { x: 11, y: 3 }, Direction.Up);
//
//         httpMock.expectOne(localUrl('place', `${sessionId}`)).error(new ErrorEvent('Turn wifi on!'));
//     });
//
//     it('should call POST request with http client when exchanging', fakeAsync(() => {
//         // Inspiration: https://www.syntaxsuccess.com/viewarticle/mocking-http-request-with-httpclient-in-angular
//         service.exchangeLetters(lettersToExchange);
//         const request = httpMock.match(localUrl('exchange', `${sessionId}`));
//
//         expect(request[0].request.method).toEqual('POST');
//
//         request[0].flush([]);
//     }));
//
//     it('should call POST request with http client when skipping', fakeAsync(() => {
//         service.skipTurn();
//         const request = httpMock.match(localUrl('skip', `${sessionId}`));
//
//         expect(request[0].request.method).toEqual('POST');
//     }));
//
//     it('should call POST request with http client when trying to place letter', fakeAsync(async () => {
//         letterToPlace = [{ letter: 'k', position: { x: 11, y: 3 } }];
//         const answer = { isSuccess: true, body: 'Error' };
//
//         boardServiceSpy['retrievePlacements'].and.returnValue(letterToPlace);
//
//         service.placeLetters('k', { x: 11, y: 3 }, Direction.Up);
//
//         const request = httpMock.expectOne(localUrl('place', `${sessionId}`));
//         request.flush(answer);
//         expect(request.request.method).toEqual('POST');
//     }));
//
//     it('should reset game data if reset function called', () => {
//         service.reset();
//         expect(reserveServiceSpy['reset']).toHaveBeenCalled();
//         expect(boardServiceSpy['reset']).toHaveBeenCalled();
//     });
// });
