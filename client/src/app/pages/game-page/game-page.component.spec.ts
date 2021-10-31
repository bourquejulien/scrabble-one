/* eslint-disable max-classes-per-file -- Needs many stub implementations */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Injectable, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogClose, MatDialogModule } from '@angular/material/dialog';
import { MatToolbar } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GameConfig } from '@app/classes/game-config';
import { cleanStyles } from '@app/classes/helpers/cleanup.helper';
import { PlayerStats } from '@app/classes/player/player-stats';
import { PlayerType } from '@app/classes/player/player-type';
import { TimePipe } from '@app/classes/time/time.pipe';
import { TimeSpan } from '@app/classes/time/timespan';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { GamePageComponent } from './game-page.component';
import { GameType } from '@common';

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
    gameEnding: Subject<void> = new Subject<void>();
    currentTurn: PlayerType = PlayerType.Local;
    gameConfig: GameConfig = {
        gameType: GameType.SinglePlayer,
        playTime: TimeSpan.fromSeconds(0),
        firstPlayerName: '',
        secondPlayerName: '',
    };

    nextTurn(): void {
        if (this.currentTurn === PlayerType.Local) {
            this.currentTurn = PlayerType.Virtual;
        } else {
            this.currentTurn = PlayerType.Local;
        }
    }

    skipTurn(): void {
        this.nextTurn();
    }

    sendRackInCommunication(): void {
        // this function does nothing
    }
}

@Component({
    selector: 'app-play-area',
    template: '',
})
class PlayAreaStubComponent {}

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameService: GameService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, PlayAreaStubComponent, MatToolbar, TimePipe, MatDialogClose],
            providers: [{ provide: GameService, useClass: GameServiceStub }],
            imports: [AppMaterialModule, MatDialogModule, BrowserAnimationsModule, RouterTestingModule.withRoutes([]), HttpClientTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameService = TestBed.inject(GameService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call toggle function if toggleDrawer called', () => {
        const spy = spyOn(component.drawer, 'toggle');

        component.toggleDrawer();
        expect(spy).toHaveBeenCalled();
    });

    it('should call sendRackInCommunication function if endGame called', () => {
        const spy = spyOn(gameService, 'sendRackInCommunication').and.callThrough();

        component.endGame();
        expect(spy).toHaveBeenCalled();
    });

    afterAll(() => cleanStyles());
});
