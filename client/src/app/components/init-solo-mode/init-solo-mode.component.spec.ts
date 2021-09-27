/* eslint-disable max-classes-per-file -- Multiple stub implementation needed */
import { CUSTOM_ELEMENTS_SCHEMA, Injectable, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { PlayerType } from '@app/classes/player-type';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { InitSoloModeComponent } from './init-solo-mode.component';

@Injectable({
    providedIn: 'root',
})
class GameServiceStub {
    currentTurn: PlayerType = PlayerType.Local;
}

class MatDialogStub {
    close() {
        // Does nothing
    }
}

fdescribe('InitSoloModeComponent', () => {
    let init: InitSoloModeComponent;
    let fixture: ComponentFixture<InitSoloModeComponent>;
    // const VALID_NAMES = ['Jean', 'RenÉéÎîÉéÇçÏï'];
    const INVALID_NAMES = ['moulon', 'Jo', 'Josiannnnnnnnnnne', 'Jean123'];

    const routerMock = {
        navigate: jasmine.createSpy('navigate'),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InitSoloModeComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule, FormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: Router, useValue: routerMock },
                { provide: GameService, useValue: GameServiceStub },
                { provide: MatDialogRef, useValue: MatDialogStub },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InitSoloModeComponent);
        init = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(init).toBeTruthy();
    });
    it('should initialize', () => {
        // const spy = spyOn(init, 'initialize');
        // for (const name of VALID_NAMES) {
        // }
    });
    it('should not initialize', () => {
        for (const name of INVALID_NAMES) {
            expect(init.initialize(name)).toBeFalse();
        }
    });
});
