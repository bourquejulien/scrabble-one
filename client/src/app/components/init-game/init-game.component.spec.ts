/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file -- Multiple stub implementation needed */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Injectable, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { NameValidator } from '@app/classes/form-validation/name-validator';
import { cleanStyles } from '@app/classes/helpers/cleanup.helper';
import { PlayerType } from '@app/classes/player/player-type';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { RoomService } from '@app/services/room/room.service';
import { GameMode, GameType, VirtualPlayerLevel } from '@common';
import { InitGameComponent } from './init-game.component';

@Injectable({
    providedIn: 'root',
})
class dataStub {
    gameType: GameType; 
    gameMode: GameMode = GameMode.Classic;
}

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

@Injectable({
    providedIn: 'root',
})
class NameValidatorStub {
    get isValid(): boolean {
        return true;
    }
}

const THIRTY_SECONDS = 30;
const FIVE_MINUTES = 5;
const FOUR_MINUTES = 4;

fdescribe('InitGameComponent', () => {
    let component: InitGameComponent;
    let fixture: ComponentFixture<InitGameComponent>;
    let roomServiceSpyObj: jasmine.SpyObj<RoomService>;
    let routerSpy: jasmine.SpyObj<Router>;    

    const NAMES = ['Jean', 'RenÉéÎîÉéÇçÏï', 'moulon', 'Jo', 'Josiannnnnnnnnnne', 'Jean123', 'A1', 'Alphonse', ''];

    beforeEach(async () => {
        // gameTypeVal = GameType.SinglePlayer;
        roomServiceSpyObj = jasmine.createSpyObj('RoomService', ['create']);
        roomServiceSpyObj.create.and.returnValue(Promise.resolve());
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        
        await TestBed.configureTestingModule({
            declarations: [InitGameComponent],
            imports: [HttpClientTestingModule, AppMaterialModule, BrowserAnimationsModule, FormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: GameService, useClass: GameServiceStub },
                { provide: MatDialogRef, useClass: MatDialogStub },
                { provide: NameValidator, useClass: NameValidatorStub},
                { provide: MAT_DIALOG_DATA, useClass: dataStub},
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InitGameComponent);
        component = fixture.componentInstance;
        component.data.gameType = GameType.SinglePlayer;
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

    it('should get virtualPlayer level depending on its name', () => {
        component.formConfig.virtualPlayerLevelName = 'Éléanore';
        expect(component.virtualPlayerLevel).toEqual(VirtualPlayerLevel.Expert);
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

    it('should close dialog once init confirmed', async() => {
        spyOn<any>(component, 'confirmInitialization').and.returnValue(true);
        const spy = spyOn(component.dialogRef, 'close');
        await component.init();
        expect(spy).toHaveBeenCalled();
    });

    it('should init single player game if single player selected', async() => {
        const spy = spyOn<any>(component, 'initSinglePlayer');
        spyOn<any>(component, 'confirmInitialization').and.returnValue(true);

        await component.init();
        spy.and.callThrough();

        expect(spy).toHaveBeenCalled();
    });

    it('should init multiplayer game if multiplayer selected', async() => {
        component.data.gameType = GameType.Multiplayer;
        fixture.detectChanges();
        const spy = spyOn<any>(component, 'initMultiplayer');
        spyOn<any>(component, 'confirmInitialization').and.returnValue(true);
        
        await component.init();
        spy.and.callThrough();

        expect(spy).toHaveBeenCalled();
    });

    it('should confirm initialization if valid name', async() => {
        spyOnProperty(component.nameValidator, 'isValid').and.returnValue(true);
        let confirm = component['confirmInitialization']();
        expect(confirm).toBe(true);

    });

    it('should not confirm initialization if invalid name', async() => {
        spyOnProperty(component.nameValidator, 'isValid').and.returnValue(false);
        let confirm = component['confirmInitialization']();
        expect(confirm).toBe(false);
    });

    afterAll(() => cleanStyles());
});
