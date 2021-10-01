import { TestBed } from '@angular/core/testing';

import { EndGameService } from './end-game.service';

describe('EndGameService', () => {
    let service: EndGameService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(EndGameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
