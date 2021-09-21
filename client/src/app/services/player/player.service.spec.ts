import { TestBed } from '@angular/core/testing';

import { PlayerService } from '@app/services/player/player.service';

describe('PlayerService', () => {
    let service: PlayerService;
    let letterToRemoveFromRack: string;
    let invalidLetter: string;

    beforeEach(() => {
        letterToRemoveFromRack = 'E';
        invalidLetter = 'Z';
        const mockRack = ['K', 'E', 'S', 'E', 'I', 'O', 'V'];

        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayerService);

        service.setRack(mockRack);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should decrease length of rack if valid letter succesfully removed from rack', () => {
        const currentLength = service.length;
        service.updateRack(letterToRemoveFromRack);

        expect(service.length).toBe(currentLength - 1);
    });

    it('should succesfully remove first occurence of valid letter of multiple occurences from rack', () => {
        service.updateRack(letterToRemoveFromRack);

        expect(service.rack[1]).toBe('S');
    });

    it('should decrease length of rack if valid letter with multiple occurences succesfully removed from rack', () => {
        const currentLength = service.length;
        service.updateRack(letterToRemoveFromRack);
        service.updateRack(letterToRemoveFromRack);

        expect(service.length).toBe(currentLength - 2);
    });

    it('should succesfully remove first occurence of valid letter from rack', () => {
        service.updateRack(letterToRemoveFromRack);
        service.updateRack(letterToRemoveFromRack);

        expect(service.rack[2]).toBe('I');
    });

    it('should not affect rack if invalid letter tries to be removed', () => {
        const currentLength = service.length;
        service.updateRack(invalidLetter);

        expect(service.length).toBe(currentLength);
    });
});
