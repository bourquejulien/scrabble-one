import { TestBed } from '@angular/core/testing';
import { ReserveService } from './reserve.service';

describe('ReserveService', () => {
    let letterToExchange: string;
    let service: ReserveService;

    beforeEach(() => {
        letterToExchange = 'A';
        const mockReserve = ['A', 'A', 'A', 'B', 'B', 'C'];

        TestBed.configureTestingModule({ providers: [] });
        service = TestBed.inject(ReserveService);

        service.setReserve(mockReserve);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have added letter in reserve at the correct index', () => {
        service.putBackLetter(letterToExchange);
        // Before putBackLetter, reserve[3] should contain a 'B'
        expect(service['reserve'][3]).toBe('A');
    });

    it('should increase length of reserve by one if letterToExchange successfully added', () => {
        const currentLength = service.length;
        service.putBackLetter(letterToExchange);

        expect(service.length).toBe(currentLength + 1);
    });

    it('should not add anything to reserve if empty letterToExchange', () => {
        const currentLength = service.length;
        letterToExchange = '';

        service.putBackLetter(letterToExchange);
        expect(service.length).toBe(currentLength);
    });

    it('should decrease length of reserve if letter succesfully drawn', () => {
        const currentLength = service.length;
        service.drawLetter();

        expect(service.length).toBe(currentLength - 1);
    });

    it('should successfully return the drawn letter from reserve', () => {
        spyOn(Math, 'floor').and.returnValue(3);
        expect(service.drawLetter()).toBe('B');
    });

    // it('should check that Math.floor has been called', () => {
    //     expect(Math.floor).toHaveBeenCalledWith(3);
    // });

    it('should return letter at first index in reserve', () => {
        spyOn(Math, 'random').and.returnValue(0);
        expect(service.drawLetter()).toBe('A');
    });

    /* it('should chack that Math.random has been called', () => {
        expect(Math.random).toHaveBeenCalledWith();
    });*/

    it('should return letter at last index in reserve', () => {
        spyOn(Math, 'random').and.returnValue(1);
        expect(service.drawLetter()).toBe('C');
    });

    it('should return reserve length', () => {
        expect(service.length).toBe(service['reserve'].length);
    });
});
