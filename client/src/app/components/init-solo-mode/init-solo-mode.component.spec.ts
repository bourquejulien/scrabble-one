/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file -- Multiple stub implementation needed */
import { CUSTOM_ELEMENTS_SCHEMA, Injectable, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
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
    startGame(): void {
        // Does Nothing
    }
}
@Injectable({
    providedIn: 'root',
})
class MatDialogStub {
    close() {
        // Does Nothing
    }
}
const THIRTY_SECONDS = 30;
const FIVE_MINUTES = 5;
const FOUR_MINUTES = 4;
describe('InitSoloModeComponent', () => {
    let component: InitSoloModeComponent;
    let fixture: ComponentFixture<InitSoloModeComponent>;
    const NAMES = ['Jean', 'RenÉéÎîÉéÇçÏï', 'moulon', 'Jo', 'Josiannnnnnnnnnne', 'Jean123', 'A1', 'Alphonse', ''];
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
                { provide: GameService, useClass: GameServiceStub },
                { provide: MatDialogRef, useClass: MatDialogStub },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InitSoloModeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should not contains any error', () => {
        component.gameConfig.firstPlayerName = NAMES[0];
        component.initialize();
        expect(component.errorsList).toEqual([]);
    });
    it('should not contains any error', () => {
        component.gameConfig.firstPlayerName = NAMES[1];
        component.initialize();
        expect(component.errorsList).toEqual([]);
    });
    it('should have error for lower letter', () => {
        component.gameConfig.firstPlayerName = NAMES[2];
        component.initialize();
        expect(component.errorsList).toEqual(['*Le nom doit débuter par une majuscule.\n']);
    });
    it('should have error for minimum length', () => {
        component.gameConfig.firstPlayerName = NAMES[3];
        component.initialize();
        expect(component.errorsList).toEqual(['*Le nom doit contenir au moins 3 caractères.\n']);
    });
    it('should have error for maximum length', () => {
        component.gameConfig.firstPlayerName = NAMES[4];
        component.initialize();
        expect(component.errorsList).toEqual(['*Le nom doit au maximum contenir 16 lettres.\n']);
    });
    it('should have error for not having name', () => {
        component.initialize();
        expect(component.errorsList).toEqual(['*Un nom doit être entré.\n']);
    });
    it('should have error for not containing only letters', () => {
        component.gameConfig.firstPlayerName = NAMES[5];
        component.initialize();
        expect(component.errorsList).toEqual(['*Le nom doit seulement être composé de lettres.\n']);
    });
    it('should have error for not containing only letters and minimum length', () => {
        component.gameConfig.firstPlayerName = NAMES[6];
        component.initialize();
        expect(component.errorsList).toEqual(['*Le nom doit seulement être composé de lettres.\n', '*Le nom doit contenir au moins 3 caractères.\n']);
    });
    it('should call botNameChange', fakeAsync(() => {
        const spy = spyOn(component, 'botNameChange');
        const input = fixture.debugElement.query(By.css('#inputName'));
        input.triggerEventHandler('input', {});
        tick();
        expect(spy).toHaveBeenCalled();
    }));
    it('should change bot name', fakeAsync(() => {
        const input = fixture.debugElement.query(By.css('#inputName'));
        component.gameConfig.firstPlayerName = NAMES[7];
        component.gameConfig.secondPlayerName = NAMES[7];
        input.triggerEventHandler('input', {});
        tick();
        expect(component.gameConfig.secondPlayerName).not.toEqual('Alphonse');
    }));
    it('should call forceSecondsToZero ', fakeAsync(() => {
        const spy = spyOn(component, 'forceSecondsToZero');
        const select = fixture.debugElement.query(By.css('#selectMinutes'));
        select.triggerEventHandler('selectionChange', {});
        tick();
        expect(spy).toHaveBeenCalled();
    }));
    it('should forceSecondsToZero ', fakeAsync(() => {
        const select = fixture.debugElement.query(By.css('#selectMinutes'));
        component.minutes = FIVE_MINUTES;
        component.seconds = THIRTY_SECONDS;
        select.triggerEventHandler('selectionChange', {});
        tick();
        expect(component.seconds).toEqual(0);
    }));
    it('should not forceSecondsToZero ', fakeAsync(() => {
        const select = fixture.debugElement.query(By.css('#selectMinutes'));
        component.minutes = FOUR_MINUTES;
        component.seconds = THIRTY_SECONDS;
        select.triggerEventHandler('selectionChange', {});
        tick();
        expect(component.seconds).not.toEqual(0);
    }));
    it('should Initialize when pressing enter ', fakeAsync(() => {
        const keyEvent = new KeyboardEvent('keypress', { key: 'Enter', cancelable: true });
        const spy = spyOn(component, 'initialize').and.callThrough();
        component.buttonDetect(keyEvent);
        expect(spy).toHaveBeenCalled();
    }));
    it('should not Initialize when pressing something else than enter ', fakeAsync(() => {
        const keyEvent = new KeyboardEvent('keypress', { key: 'y', cancelable: true });
        const spy = spyOn(component, 'initialize').and.callThrough();
        component.buttonDetect(keyEvent);
        expect(spy).not.toHaveBeenCalled();
    }));
});
