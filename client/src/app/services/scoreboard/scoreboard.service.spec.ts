import { TestBed } from '@angular/core/testing';
import { ScoreboardService } from './scoreboard.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ScoreboardService', () => {
    let service: ScoreboardService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(ScoreboardService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
