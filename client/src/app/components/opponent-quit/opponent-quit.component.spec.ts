/* eslint-disable dot-notation -- we need access to private properties for the test */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameService } from '@app/services/game/game.service';
import { OpponentQuitComponent } from './opponent-quit.component';
@Injectable({
    providedIn: 'root',
})
class MatDialogStub {
    closeAll() {
        // Does Nothing
    }
}

describe('OpponentQuitComponent', () => {
    let component: OpponentQuitComponent;
    let fixture: ComponentFixture<OpponentQuitComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['reset']);
        await TestBed.configureTestingModule({
            declarations: [OpponentQuitComponent],
            imports: [HttpClientTestingModule, MatDialogModule],
            providers: [
                { provide: MatDialogRef, useClass: MatDialogStub },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OpponentQuitComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should reset game if quit', () => {
        component.quit();
        expect(gameServiceSpy['reset']).toHaveBeenCalled();
    });

    it('should close all dialogs if quit', () => {
        const spy = spyOn<any>(component['dialogRef'], 'closeAll');
        component.quit();
        expect(spy).toHaveBeenCalled();
    });

    it('should close all dialogs if continue', () => {
        const spy = spyOn<any>(component['dialogRef'], 'closeAll');
        component.continue();
        expect(spy).toHaveBeenCalled();
    });
});
