/* eslint-disable @typescript-eslint/no-unused-expressions */
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { cleanStyles } from '@app/classes/helpers/cleanup.helper';
import { PlayerType } from '@app/classes/player/player-type';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { OpponentQuitComponent } from './opponent-quit.component';

describe('OpponentQuitComponent', () => {
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let component: OpponentQuitComponent;
    let fixture: ComponentFixture<OpponentQuitComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    const playerType = PlayerType.Local;
    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatBar', ['open', 'closeAll']);
        gameServiceSpy = jasmine.createSpyObj('GameService', ['reset'], { currentTurn: playerType });
        await TestBed.configureTestingModule({
            declarations: [OpponentQuitComponent],
            imports: [AppMaterialModule, BrowserAnimationsModule, FormsModule],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: MatDialog, useValue: matDialogSpy },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
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

    it('should call reset on gameService', () => {
        component.quit();
        expect(gameServiceSpy.reset).toHaveBeenCalled();
    });

    it('should call closeAll on gameService', () => {
        component.continue();
        expect(matDialogSpy.closeAll).toHaveBeenCalled();
    });

    afterAll(() => cleanStyles());
});
