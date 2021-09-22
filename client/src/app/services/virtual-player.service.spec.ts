import { TestBed } from '@angular/core/testing';
import { VirtualPlayerService } from '@app/services/virtual-player.service';

describe('VirtualPlayerService', () => {
    let service: VirtualPlayerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(VirtualPlayerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
