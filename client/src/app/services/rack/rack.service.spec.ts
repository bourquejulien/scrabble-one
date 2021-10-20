import { TestBed } from '@angular/core/testing';

import { RackService } from './rack.service';

const LETTERS = ['a', 'b', 'c', 'd'];

describe('RackService', () => {
    let service: RackService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RackService);

        service.rack.push(...LETTERS);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should swap left', () => {
        service.swapLeft(0);
        expect(service.rack).toEqual(['b', 'c', 'd', 'a']);

        service.swapLeft(service.length - 1);
        expect(service.rack).toEqual(['b', 'c', 'a', 'd']);
    });

    it('should swap right', () => {
        service.swapRight(service.length - 1);
        expect(service.rack).toEqual(['d', 'a', 'b', 'c']);

        service.swapRight(0);
        expect(service.rack).toEqual(['a', 'd', 'b', 'c']);
    });

    it('should return indexOf', () => {
        const POSITION = 2;

        service.indexOf(LETTERS[POSITION]);
        expect(service.indexOf(LETTERS[POSITION])).toEqual(POSITION);

        service.indexOf(LETTERS[POSITION], 1);
        expect(service.indexOf(LETTERS[POSITION])).toEqual(POSITION);

        service.indexOf(LETTERS[POSITION], 2 + LETTERS.length);
        expect(service.indexOf(LETTERS[POSITION])).toEqual(POSITION);
    });

    it('should empty', () => {
        service.empty();
        expect(service.length).toEqual(0);
    });
});
