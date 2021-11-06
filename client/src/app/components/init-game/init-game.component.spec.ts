/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
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
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RoomService } from '@app/services/room/room.service';

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
    let roomServiceSpyObj: jasmine.SpyObj<RoomService>;
    const NAMES = ['Jean', 'RenÉéÎîÉéÇçÏï', 'moulon', 'Jo', 'Josiannnnnnnnnnne', 'Jean123', 'A1', 'Alphonse', ''];
    const routerMock = {
        navigate: jasmine.createSpy('navigate').and.callThrough(),
    };

    beforeEach(async () => {
        roomServiceSpyObj = jasmine.createSpyObj('RoomService', ['create']);
        roomServiceSpyObj.create.and.returnValue(Promise.resolve());
        await TestBed.configureTestingModule({
            declarations: [InitGameComponent],
            imports: [HttpClientTestingModule, AppMaterialModule, BrowserAnimationsModule, FormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: Router, useValue: routerMock },
                { provide: GameService, useClass: GameServiceStub },
                { provide: MatDialogRef, useClass: MatDialogStub },
                { provide: MAT_DIALOG_DATA, useValue: { gameModeType: GameType.SinglePlayer } },
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

    it('should change bot name', () => {
        const FIRST_PLAYER_NAME = 'Alphonse';
        component.formConfig.firstPlayerName = NAMES[7];
        component.formConfig.secondPlayerName = NAMES[7];

        component.botNameChange(FIRST_PLAYER_NAME);
        expect(component.formConfig.secondPlayerName).not.toEqual(FIRST_PLAYER_NAME);
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

    it('should init appropriate games', async () => {
        roomServiceSpyObj.create.and.returnValue(Promise.resolve());
        spyOnProperty(component['nameValidator'], 'isValid', 'get').and.returnValue(true);
        component['initMultiplayer']();
        component['initSinglePlayer']();
        expect(routerMock.navigate).toHaveBeenCalledTimes(1);
    });

    it('should init correct game type', async () => {
        roomServiceSpyObj.create.and.returnValue(Promise.resolve());
        spyOnProperty(component['nameValidator'], 'isValid', 'get').and.returnValue(true);
        component['init']();
        expect(routerMock.navigate).toHaveBeenCalled();
    });

    afterAll(() => cleanStyles());
});
