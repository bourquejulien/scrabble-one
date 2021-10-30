/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file -- Multiple stub implementation needed */
import { CUSTOM_ELEMENTS_SCHEMA, Injectable, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { cleanStyles } from '@app/classes/helpers/cleanup.helper';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { InitGameComponent } from './init-game.component';
import { PlayerType } from '@app/classes/player/player-type';
import { GameType } from '@common';

@Injectable({
    providedIn: 'root',
})
class GameServiceStub {
    currentTurn: PlayerType = PlayerType.Local;
    startSinglePlayer(): void {
        // Does Nothing
    }

    reset(): void {
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

describe('InitGameComponent', () => {
    let component: InitGameComponent;
    let fixture: ComponentFixture<InitGameComponent>;
    const NAMES = ['Jean', 'RenÉéÎîÉéÇçÏï', 'moulon', 'Jo', 'Josiannnnnnnnnnne', 'Jean123', 'A1', 'Alphonse', ''];
    const routerMock = {
        navigate: jasmine.createSpy('navigate'),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InitGameComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule, FormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: Router, useValue: routerMock },
                { provide: GameService, useClass: GameServiceStub },
                { provide: MatDialogRef, useClass: MatDialogStub },
                { provide: MAT_DIALOG_DATA, useValue: GameType.Multiplayer },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InitGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not contains any error', async () => {
        component.gameConfig.firstPlayerName = NAMES[0];
        await component.init();
        expect(component.errorsList).toEqual([]);
    });

    it('should not contains any error', async () => {
        component.gameConfig.firstPlayerName = NAMES[1];
        await component.init();
        expect(component.errorsList).toEqual([]);
    });

    it('should have error for lower letter', async () => {
        component.gameConfig.firstPlayerName = NAMES[2];
        await component.init();
        expect(component.errorsList).toEqual(['*Le nom doit débuter par une majuscule.\n']);
    });

    it('should have error for minimum length', async () => {
        component.gameConfig.firstPlayerName = NAMES[3];
        await component.init();
        expect(component.errorsList).toEqual(['*Le nom doit contenir au moins 3 caractères.\n']);
    });

    it('should have error for maximum length', async () => {
        component.gameConfig.firstPlayerName = NAMES[4];
        await component.init();
        expect(component.errorsList).toEqual(['*Le nom doit au maximum contenir 16 lettres.\n']);
    });

    it('should have error for not having name', async () => {
        await component.init();
        expect(component.errorsList).toEqual(['*Un nom doit être entré.\n']);
    });

    it('should have error for not containing only letters', async () => {
        component.gameConfig.firstPlayerName = NAMES[5];
        await component.init();
        expect(component.errorsList).toEqual(['*Le nom doit seulement être composé de lettres.\n']);
    });

    it('should have error for not containing only letters and minimum length', async () => {
        component.gameConfig.firstPlayerName = NAMES[6];
        await component.init();
        expect(component.errorsList).toEqual(['*Le nom doit seulement être composé de lettres.\n', '*Le nom doit contenir au moins 3 caractères.\n']);
    });

    it('should change bot name', () => {
        const FIRST_PLAYER_NAME = 'Alphonse';
        component.gameConfig.firstPlayerName = NAMES[7];
        component.gameConfig.secondPlayerName = NAMES[7];

        component.botNameChange(FIRST_PLAYER_NAME);
        expect(component.gameConfig.secondPlayerName).not.toEqual(FIRST_PLAYER_NAME);
    });

    it('should call forceSecondsToZero ', fakeAsync(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(component, 'forceSecondsToZero');
        component.manageTimeLimits();

        expect(spy).toHaveBeenCalled();
    }));

    it('should forceSecondsToZero ', fakeAsync(() => {
        component.minutes = FIVE_MINUTES;
        component.seconds = THIRTY_SECONDS;

        component.manageTimeLimits();

        expect(component.seconds).toEqual(0);
    }));

    it('should not forceSecondsToZero ', fakeAsync(() => {
        component.minutes = FOUR_MINUTES;
        component.seconds = THIRTY_SECONDS;

        component.manageTimeLimits();

        expect(component.seconds).not.toEqual(0);
    }));

    it('should force seconds to thirty', fakeAsync(() => {
        component.minutes = 0;
        component.seconds = 0;

        component.manageTimeLimits();

        expect(component.seconds).toEqual(THIRTY_SECONDS);
    }));

    it('should not force seconds to thirty', fakeAsync(() => {
        component.minutes = FOUR_MINUTES;
        component.seconds = 0;

        component.manageTimeLimits();

        expect(component.seconds).not.toEqual(THIRTY_SECONDS);
    }));

    /* it('should create error if nameForm invalid', () => {
    component.gameConfig.firstPlayerName = 'allo';
    // const currentListLength = component.errorsList.length;
    component['confirmInitialization'];

    expect(component.errorsList[0]).toEqual('*Le nom doit débuter par une majuscule.\n');
});*/

    it('should init when pressing enter ', fakeAsync(() => {
        const keyEvent = new KeyboardEvent('keypress', { key: 'Enter', cancelable: true });
        const spy = spyOn(component, 'init').and.callThrough();
        component.buttonDetect(keyEvent);
        expect(spy).toHaveBeenCalled();
    }));

    it('should not init when pressing something else than enter ', fakeAsync(() => {
        const keyEvent = new KeyboardEvent('keypress', { key: 'y', cancelable: true });
        const spy = spyOn(component, 'init').and.callThrough();
        component.buttonDetect(keyEvent);
        expect(spy).not.toHaveBeenCalled();
    }));

    afterAll(() => cleanStyles());
});
