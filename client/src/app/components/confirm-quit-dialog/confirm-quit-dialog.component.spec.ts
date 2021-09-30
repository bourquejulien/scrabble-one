import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmQuitDialogComponent } from './confirm-quit-dialog.component';

describe('ConfirmQuitDialogComponent', () => {
    let component: ConfirmQuitDialogComponent;
    let fixture: ComponentFixture<ConfirmQuitDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfirmQuitDialogComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmQuitDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
