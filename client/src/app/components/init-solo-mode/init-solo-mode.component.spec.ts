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
    close(): void {
        // Does nothing
    }
}

describe('InitSoloModeComponent', () => {
    let init: InitSoloModeComponent;
    let fixture: ComponentFixture<InitSoloModeComponent>;
    const NAMES = ['Jean', 'RenÉéÎîÉéÇçÏï', 'moulon', 'Jo', 'Josiannnnnnnnnne', 'Jean123'];
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
    it('Should not contains any error', () => {
        init.gameConfig.firstPlayerName = NAMES[0];
        init.initialize();
        expect(init.errorsList).toEqual([]);
    });
    it('Should not contains any error', () => {
        init.gameConfig.firstPlayerName = NAMES[1];
        init.initialize();
        expect(init.errorsList).toEqual([]);
    });
    it('Should have error for lower letter', () => {
        init.gameConfig.firstPlayerName = NAMES[2];
        init.initialize();
        expect(init.errorsList).toEqual(['*Le nom doit débuter par une majuscule.\n']);
    });
    it('Should have error for minimum length', () => {
        init.gameConfig.firstPlayerName = NAMES[3];
        init.initialize();
        expect(init.errorsList).toEqual(['*Le nom doit contenir au moins 3 caractères.\n']);
    });
    it('Should have error for maximum length', () => {
        init.gameConfig.firstPlayerName = NAMES[4];
        init.initialize();
        expect(init.errorsList).toEqual(['*Le nom doit au maximum contenir 16 lettres.\n']);
    });
    it('Should have error for not having name', () => {
        init.initialize();
        expect(init.errorsList).toEqual(['*Un nom doit être entré.\n']);
    });
    it('Should have error for not containing only letters', () => {
        init.gameConfig.firstPlayerName = NAMES[5];
        init.initialize();
        expect(init.errorsList).toEqual(['*Le nom doit seulement être composé de lettres.\n']);
    });
});
