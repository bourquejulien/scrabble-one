import { TestBed } from '@angular/core/testing';
import { ScoreboardService } from './scoreboard.service';


describe('ScoreboardServiceService', () => {
    let service: ScoreboardService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ScoreboardService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
