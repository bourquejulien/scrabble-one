/* eslint-disable max-classes-per-file -- Needs many stub implementations */
import { Component, CUSTOM_ELEMENTS_SCHEMA, Injectable, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbar } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameConfig } from '@app/classes/game-config';
import { PlayerType } from '@app/classes/player-type';
import { Constants } from '@app/constants/global.constants';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { BehaviorSubject } from 'rxjs';
import { GamePageComponent } from './game-page.component';

@Injectable({
    providedIn: 'root',
})
class GameServiceStub {
    onTurn: BehaviorSubject<PlayerType> = new BehaviorSubject<PlayerType>(PlayerType.Local);
    gameConfig: GameConfig = {
        gameType: Constants.gameTypesList[0],
        minutes: Constants.turnLengthMinutes[1],
        seconds: Constants.turnLengthSeconds[0],
        time: 0,
        firstPlayerName: '',
        secondPlayerName: '',
    };
}

@Component({
    selector: 'app-play-area',
    template: '',
})
class PlayAreaStubComponent {}

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, PlayAreaStubComponent, MatToolbar],
            providers: [{ provide: GameService, useClass: GameServiceStub }],
            imports: [AppMaterialModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
