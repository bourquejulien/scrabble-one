import { TestBed } from '@angular/core/testing';
import { ReserveService } from './reserve.service';


describe('ReserveService', () => {
    let service: ReserveService;
    let letterToExchange: string;
    let mockReserve: string[];

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ReserveService);
        letterToExchange = 'A';
        mockReserve = ['A', 'A', 'A', 'B', 'B', 'C', 'C'];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should increase length of reserve', () => {
        const currentLength = service.length;

        service.putBackLetter(letterToExchange);
        expect(service.length).toBe(currentLength + 1);
    });

    it('should successfully remove a letter from reserve', () => {
        service.putBackLetter(letterToExchange);
        expect(service.drawLetter).toBe('B');
    });

    it('should decrease length in reserve', () => {
        const currentLength = service.length;

        service.drawLetter();
        expect(service['reserve'].length).toBe(currentLength - 1);
    });

    it('should successfully return a letter from reserve', () => {
        spyOn(Math, 'floor').and.returnValue(10);
        expect(service.drawLetter).toBe('B');
    });

    it('should successfully return a letter from reserve', () => {
        spyOn(Math, 'floor').and.returnValue(10);
        expect(service.drawLetter).toBe('B');
    });

    it('should return reserve length', () => {
        expect(service.length).toBe(service['reserve'].length);
    });
});

