import { TestBed } from '@angular/core/testing';
import { Timer } from './timer';


describe('Timer', () => {
    let timer: Timer;

    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    it('should be created', () => {
        expect(timer).toBeTruthy();
    });

    it('should not go in the negative', () => {

    });
});