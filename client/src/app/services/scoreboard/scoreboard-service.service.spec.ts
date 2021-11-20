import { TestBed } from '@angular/core/testing';

import { ScoreboardServiceService } from './scoreboard-service.service';

describe('ScoreboardServiceService', () => {
  let service: ScoreboardServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoreboardServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
