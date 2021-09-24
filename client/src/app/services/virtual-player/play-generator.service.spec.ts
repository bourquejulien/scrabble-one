import { TestBed } from '@angular/core/testing';

import { PlayGeneratorService } from '@app/services/virtual-player/play-generator.service';

describe('PlayGeneratorService', () => {
    let service: PlayGeneratorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayGeneratorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
