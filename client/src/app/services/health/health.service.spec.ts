import { TestBed } from '@angular/core/testing';

import { HealthService } from './health.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('HealthService', () => {
    let service: HealthService;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(HealthService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
