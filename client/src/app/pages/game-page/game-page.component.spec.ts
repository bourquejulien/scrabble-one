/* eslint-disable max-classes-per-file -- Needs many stub implementations */
import { Component, CUSTOM_ELEMENTS_SCHEMA, Injectable, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbar } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameConfig } from '@app/classes/game-config';
import { PlayerType } from '@app/classes/player-type';
import { PlayerStats } from '@app/classes/player/player-stats';
import { TimePipe } from '@app/classes/time/time.pipe';
import { TimeSpan } from '@app/classes/time/timespan';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { BehaviorSubject } from 'rxjs';
import { GamePageComponent } from './game-page.component';

const GAME_TYPES_LIST = ['Mode Solo Débutant'];

@Injectable({
    providedIn: 'root',
})
class GameServiceStub {
    firstPlayerStats: PlayerStats = {
        points: 0,
        rackSize: 0,
    };
    secondPlayerStats: PlayerStats = {
        points: 0,
        rackSize: 0,
    };
    onTurn: BehaviorSubject<PlayerType> = new BehaviorSubject<PlayerType>(PlayerType.Local);
    gameConfig: GameConfig = {
        gameType: GAME_TYPES_LIST[0],
        playTime: TimeSpan.fromSeconds(0),
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
            declarations: [GamePageComponent, PlayAreaStubComponent, MatToolbar, TimePipe],
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
