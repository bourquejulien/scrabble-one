import { TestBed } from '@angular/core/testing';

import { FakeGameService } from './fake-game.service';

describe('FakeGameService', () => {
  let service: FakeGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FakeGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
