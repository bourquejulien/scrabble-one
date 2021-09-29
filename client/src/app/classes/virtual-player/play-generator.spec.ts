import { TestBed } from '@angular/core/testing';
import { PlayGenerator } from './play-generator';

describe('PlayGenerator', () => {
    let PlayGenerator: PlayGenerator;

    beforeEach(() => {
        PlayGenerator = TestBed.inject(PlayGenerator);
    });

    it('should be created', () => {
        expect(new PlayGenerator()).toBeTruthy();
    });
});
