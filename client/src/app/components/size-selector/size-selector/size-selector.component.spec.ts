import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';

import { SizeSelectorComponent } from './size-selector.component';

describe('SizeSelectorComponent', () => {
    let component: SizeSelectorComponent;
    let fixture: ComponentFixture<SizeSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SizeSelectorComponent, MatIcon],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SizeSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
