/* eslint-disable max-classes-per-file -- Needs many stub implementations */
import { Component, CUSTOM_ELEMENTS_SCHEMA, Injectable, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbar } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameConfig } from '@app/classes/game-config';
import { PlayerType } from '@app/classes/player-type';
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
    onTurn: BehaviorSubject<PlayerType> = new BehaviorSubject<PlayerType>(PlayerType.Local);
    currentTurn: PlayerType = PlayerType.Local;
    gameConfig: GameConfig = {
        gameType: GAME_TYPES_LIST[0],
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
}

@Component({
    selector: 'app-play-area',
    template: '',
})
class PlayAreaStubComponent {}

fdescribe('GamePageComponent', () => {
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

    it('should call confirmQuit function if first button index', () => {
        const currentButtonIndex = 0;
        const spy = spyOn(component, 'confirmQuit');

        component.callFunction(currentButtonIndex);
        expect(spy).toHaveBeenCalled();
    });

    it('should call toggleDrawer function if second button index', () => {
        const currentButtonIndex = 1;
        const spy = spyOn(component, 'toggleDrawer');

        component.callFunction(currentButtonIndex);
        expect(spy).toHaveBeenCalled();
    });

    it('should call nextTurn function if third button index', () => {
        const currentButtonIndex = 2;
        component.callFunction(currentButtonIndex);

        expect(component.gameService.currentTurn).toEqual(PlayerType.Virtual);
    });

    it('should call angular material toggle function if toggleDrawer called', () => {
        const spy = spyOn(component.drawer, 'toggle');

        component.toggleDrawer();
        expect(spy).toHaveBeenCalled();
    });
});
