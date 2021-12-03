/* eslint-disable max-classes-per-file -- Needs many stub implementations */
// import { HttpClientTestingModule } from '@angular/common/http/testing';
/* eslint-disable dot-notation -- Need to access private properties for testing*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Injectable, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatToolbar } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EndGameWinner } from '@app/classes/end-game-winner';
import { GameConfig } from '@app/classes/game-config';
import { cleanStyles } from '@app/classes/helpers/cleanup.helper';
import { PlayerType } from '@app/classes/player/player-type';
import { TimeSpan } from '@app/classes/time/timespan';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameService } from '@app/services/game/game.service';
import { GameMode, GameType, SessionStats } from '@common';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { GamePageComponent } from './game-page.component';

@Injectable({
    providedIn: 'root',
})
class GameServiceStub {
    stats: SessionStats = {
        localStats: { points: 0, rackSize: 0 },
        remoteStats: { points: 0, rackSize: 0 },
    };

    turnSubject: BehaviorSubject<PlayerType> = new BehaviorSubject<PlayerType>(PlayerType.Local);
    gameEndingSubject: Subject<EndGameWinner> = new Subject<EndGameWinner>();
    opponentQuitingSubject: Subject<boolean> = new Subject<boolean>();

    gameEnding: Subject<void> = new Subject<void>();
    currentTurn: PlayerType = PlayerType.Local;
    gameConfig: GameConfig = {
        gameMode: GameMode.Classic,
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

    reset(): void {
        // This function does nothing
    }

    get onTurn(): Observable<PlayerType> {
        return this.turnSubject.asObservable();
    }

    get onGameEnding(): Observable<EndGameWinner> {
        return this.gameEndingSubject.asObservable();
    }

    get onOpponentQuit(): Observable<boolean> {
        return this.opponentQuitingSubject.asObservable();
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
    const routerMock = {
        navigate: jasmine.createSpy('navigate'),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, PlayAreaStubComponent, MatToolbar],
            providers: [
                { provide: Router, useValue: routerMock },
                { provide: GameService, useClass: GameServiceStub },
            ],
            imports: [AppMaterialModule, MatDialogModule, BrowserAnimationsModule, RouterTestingModule.withRoutes([]), HttpClientTestingModule],
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

    it('should call confirmQuit if first button is clicked', () => {
        const spy = spyOn<any>(component, 'confirmQuit');
        component['buttonConfig'][0].action();
        expect(spy).toHaveBeenCalled();
    });

    it('should change the theme', () => {
        const spy = spyOn<any>(component, 'toggleDarkMode');
        component['buttonConfig'][3].action();
        expect(spy).toHaveBeenCalled();
    });

    it('should call toggleDrawer if second button is clicked', () => {
        const spy = spyOn<any>(component, 'toggleDrawer');
        component['buttonConfig'][1].action();
        expect(spy).toHaveBeenCalled();
    });

    it('should call parseInput if third button is clicked', async () => {
        const spy = spyOn<any>(component['commandService'], 'parseInput');
        component['buttonConfig'][2].action();
        spy.and.callThrough();
        expect(spy).toHaveBeenCalled();
    });

    it('should call toggle function if toggleDrawer called', () => {
        const spy = spyOn(component.drawer, 'toggle');

        component['toggleDrawer']();
        expect(spy).toHaveBeenCalled();
    });

    it('should call dialogRef if trying to quit game', () => {
        const spy = spyOn(component['dialog'], 'open').and.returnValue({
            afterClosed: () => of(true),
        } as MatDialogRef<typeof component>);
        component['confirmQuit']();
        expect(spy).toHaveBeenCalled();
    });

    it('should stay on page if result is false', () => {
        spyOn(component['dialog'], 'open').and.returnValue({
            afterClosed: () => of(false),
        } as MatDialogRef<typeof component>);
        const spy = spyOn<any>(component.gameService, 'reset');
        component['confirmQuit']();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should reroute to home', () => {
        spyOn(component['dialog'], 'open').and.returnValue({
            afterClosed: () => of(true),
        } as MatDialogRef<typeof component>);
        const spy = spyOn<any>(component.gameService, 'reset');
        component['confirmQuit']();
        expect(spy).toHaveBeenCalled();
    });

    it('should call dialogRef if trying to endGame', () => {
        const winner = EndGameWinner.Local;
        const spy = spyOn(component['dialog'], 'open').and.returnValue({
            afterClosed: () => of(true),
        } as MatDialogRef<typeof component>);
        component['endGame'](winner);
        expect(spy).toHaveBeenCalled();
    });

    it('should reset game data if game ended', () => {
        const winner = EndGameWinner.Local;
        spyOn(component['dialog'], 'open').and.returnValue({
            afterClosed: () => of(true),
        } as MatDialogRef<typeof component>);
        const spy = spyOn<any>(component.gameService, 'reset');
        component['endGame'](winner);
        expect(spy).toHaveBeenCalled();
    });

    it('should not reset game data if game not ended', () => {
        const winner = EndGameWinner.Local;
        spyOn(component['dialog'], 'open').and.returnValue({
            afterClosed: () => of(false),
        } as MatDialogRef<typeof component>);
        const spy = spyOn<any>(component.gameService, 'reset');
        component['endGame'](winner);
        expect(spy).not.toHaveBeenCalled();
    });

    afterAll(() => cleanStyles());
});
