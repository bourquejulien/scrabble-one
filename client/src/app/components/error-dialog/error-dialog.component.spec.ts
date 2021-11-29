import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorDialogComponent } from './error-dialog.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('ErrorDialogComponent', () => {
    let component: ErrorDialogComponent;
    let fixture: ComponentFixture<ErrorDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ErrorDialogComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: { warningMessage: 'testing sucks!' } }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ErrorDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
