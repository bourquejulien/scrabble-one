import { TestBed } from '@angular/core/testing';

import { ReserveService } from './reserve-service.service';

describe('ReserveServiceService', () => {
    let service: ReserveService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ReserveService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
