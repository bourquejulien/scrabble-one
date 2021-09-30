/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { BoardService } from '@app/services/board/board.service';
import { PlayerService } from '@app/services/player/player.service';
// eslint-disable-next-line no-restricted-imports
import { ReserveService } from '../reserve/reserve.service';

describe('PlayerService', () => {
    let service: PlayerService;
    let reserveServiceSpy: jasmine.SpyObj<ReserveService>;
    let boardServiceSpy: jasmine.SpyObj<BoardService>;
    let letterToRemoveFromRack: string;
    let invalidLetter: string;

    beforeEach(() => {
        letterToRemoveFromRack = 'E';
        invalidLetter = 'Z';
        const mockRack = ['K', 'E', 'S', 'E', 'I', 'O', 'V'];
        reserveServiceSpy = jasmine.createSpyObj('ReserveService', ['drawLetter', 'length', 'putBackLetter', 'resetReserve']);
        reserveServiceSpy.drawLetter.and.returnValue('E');
        reserveServiceSpy.putBackLetter.and.returnValue();
        reserveServiceSpy.resetReserve.and.returnValue();
        reserveServiceSpy.length.valueOf();

        boardServiceSpy = jasmine.createSpyObj('BoardService', ['resetBoardService', 'placeLetters', 'lookupLetters', 'retrieveNewLetters']);
        boardServiceSpy.resetBoardService.and.returnValue();
        boardServiceSpy.placeLetters.and.stub();
        boardServiceSpy.lookupLetters.and.stub();
        boardServiceSpy.retrieveNewLetters.and.stub();

        TestBed.configureTestingModule({
            providers: [
                { provide: BoardService, useValue: boardServiceSpy },
                { provide: ReserveService, useValue: reserveServiceSpy },
            ],
        });
        service = TestBed.inject(PlayerService);

        service.setRack(mockRack);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should decrease length of rack if valid letter successfully removed from rack', () => {
        const currentLength = service.length;
        service['updateRack'](letterToRemoveFromRack);

        expect(service.length).toBe(currentLength - 1);
    });

    it('should successful remove first occurrence of valid letter of multiple occurrences from rack', () => {
        service['updateRack'](letterToRemoveFromRack);

        expect(service['rack'][1]).toBe('S');
    });

    it('should decrease length of rack if valid letter with multiple occurrences successful removed from rack', () => {
        const currentLength = service.length;
        service['updateRack'](letterToRemoveFromRack);
        service['updateRack'](letterToRemoveFromRack);

        expect(service.length).toBe(currentLength - 2);
    });

    it('should successful remove first occurrence of valid letter from rack', () => {
        service['updateRack'](letterToRemoveFromRack);
        service['updateRack'](letterToRemoveFromRack);

        expect(service['rack'][2]).toBe('I');
    });

    it('should not affect rack if invalid letter tries to be removed', () => {
        const currentLength = service.length;
        service['updateRack'](invalidLetter);

        expect(service.length).toBe(currentLength);
    });

    it('should set rack length to 0 when emptyRack is called', () => {
        const emptyRackLength = 0;
        service.emptyRack();
        expect(service.length).toBe(emptyRackLength);
    });

    it('should call resetReserve when resetReserveNewGame is called', () => {
        service.resetReserveNewGame();
        expect(reserveServiceSpy.resetReserve).toHaveBeenCalled();
    });

    it('should call resetBoardService when resetBoard is called', () => {
        service.resetBoard();
        expect(boardServiceSpy.resetBoardService).toHaveBeenCalled();
    });
});
