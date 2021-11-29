import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualPlayerNameComponent } from './virtual-player-name.component';

describe('VirtualPlayerNameComponent', () => {
    let component: VirtualPlayerNameComponent;
    let fixture: ComponentFixture<VirtualPlayerNameComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VirtualPlayerNameComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(VirtualPlayerNameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
