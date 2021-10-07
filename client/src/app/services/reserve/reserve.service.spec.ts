/* eslint-disable dot-notation -- reserve is private and we need access for the test */
import { TestBed } from '@angular/core/testing';
import { ReserveService } from '@app/services/reserve/reserve.service';

fdescribe('ReserveService', () => {
    let letterToExchange: string;
    let service: ReserveService;

    beforeEach(() => {
        letterToExchange = 'a';
        const mockReserve = ['a', 'a', 'a', 'b', 'b', 'c'];

        TestBed.configureTestingModule({ providers: [] });
        service = TestBed.inject(ReserveService);

        service.setReserve(mockReserve);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have added letter in reserve at the correct index', () => {
        service.putBackLetter(letterToExchange);

        expect(service['reserve'][3]).toBe('a');
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

    it('should not affect reserve if trying to put back anything but a lower case letter', () => {
        const currentLength = service.length;
        service.putBackLetter('3');
        service.putBackLetter('N');
        service.putBackLetter('$');
        expect(service.length).toBe(currentLength);
    });

    it('should correctly put back and sort the reserve if trying to put back a letter that was not previously in the reserve', () => {
        const letterIndex = 4;
        service.setReserve(['a', 'a', 'b', 'c', 'e']);
        service.putBackLetter('d');
        expect(service['reserve'][letterIndex]).toBe('d');
    });

    it('should decrease length of reserve if letter succesfully drawn', () => {
        const currentLength = service.length;
        service.drawLetter();

        expect(service.length).toBe(currentLength - 1);
    });

    it('should successfully return the drawn letter from reserve', () => {
        const spy = spyOn(Math, 'floor').and.returnValue(3);
        expect(service.drawLetter()).toBe('b');
        expect(spy).toHaveBeenCalled();
    });

    it('should return letter at first index in reserve', () => {
        const spy = spyOn(Math, 'random').and.returnValue(0);
        expect(service.drawLetter()).toBe('a');
        expect(spy).toHaveBeenCalled();
    });

    it('should return letter at last index in reserve', () => {
        const spy = spyOn(Math, 'random').and.returnValue(1);
        expect(service.drawLetter()).toBe('c');
        expect(spy).toHaveBeenCalled();
    });

    it('should return letter quantity if valid letter', () => {
        const firstletterQuantity = 3;
        const secondLetterQuantity = 2;
        expect(service.getLetterQuantity('a')).toBe(firstletterQuantity);
        expect(service.getLetterQuantity('b')).toBe(secondLetterQuantity);
    });

    it('should return reserve length', () => {
        expect(service.length).toBe(service['reserve'].length);
    });

    it('should reset reserve to original length when resetReserve is called', () => {
        const reserveLength = 102;
        service.reset();
        expect(service.length).toBe(reserveLength);
    });
});
