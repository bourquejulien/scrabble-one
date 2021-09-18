import { TestBed } from '@angular/core/testing';
import { ReserveService } from './reserve.service';

describe('ReserveService', () => {
    let letterToExchange: string;
    let service: ReserveService;
    let mockReserve = ['A', 'A', 'A', 'B', 'B', 'C'];

    beforeEach(() => {
        letterToExchange = 'A';

        TestBed.configureTestingModule({ providers: [] });
        service = TestBed.inject(ReserveService);

        service.setReserve(mockReserve);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should increase length by one of reserve letterToExchange successfully added', () => {
        const currentLength = service.length;
        service.putBackLetter(letterToExchange);
        expect(service.length).toBe(currentLength + 1);
    });

    it('should increase array size by one if letterToExchange successfully added at the right index', () => {
        const lastIndex = service.length + 1;
        service.putBackLetter(letterToExchange);
        expect(service['reserve'][lastIndex]).toBe('C');
    });

    it('should not add anything to reserve if empty letterToExchange', () => {
        const currentLength = service.length;
        letterToExchange = '';

        service.putBackLetter(letterToExchange);
        expect(service.length).toBe(currentLength);
    });

    it('should decrease length by in reserve if letter succesfully drawn', () => {
        const currentLength = service.length;
        service.drawLetter();
        expect(service.length).toBe(currentLength - 1);
    });

    it('should successfully return a letter from reserve', () => {
        spyOn(Math, 'floor').and.returnValue(3);
        expect(service.drawLetter()).toBe('B');
    });

    it('should chack that Math.floor has been called', () => {
        expect(Math.floor).toHaveBeenCalledWith(3);
    })

    it('should return first index from reserve', () => {
        spyOn(Math, 'random').and.returnValue(0);
        expect(service.drawLetter()).toBe('A');
    });

    /*it('should chack that Math.random has been called', () => {
        expect(Math.random).toHaveBeenCalledWith();
    });*/
/**
 * check if index = -1 to make sure that nothing is added
 */
    it('should return last index from reserve', () => {
        spyOn(Math, 'random').and.returnValue(1);
        expect(service.drawLetter()).toBe('C');
    });

    it('should return reserve length', () => {
        expect(service.length).toBe(service['reserve'].length);
    });
});

