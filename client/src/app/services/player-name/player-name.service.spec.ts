import { TestBed } from '@angular/core/testing';

import { PlayerNameService } from './player-name.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PlayerNameService', () => {
    let service: PlayerNameService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(PlayerNameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
