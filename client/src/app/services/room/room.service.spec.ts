import { TestBed } from '@angular/core/testing';

import { RoomService } from './room.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RoomService', () => {
    let service: RoomService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(RoomService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
