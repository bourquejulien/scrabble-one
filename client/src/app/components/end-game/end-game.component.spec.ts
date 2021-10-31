import { NO_ERRORS_SCHEMA } from '@angular/compiler';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EndGameComponent } from './end-game.component';
import { GameService } from '@app/services/game/game.service';
import { cleanStyles } from '@app/classes/helpers/cleanup.helper';
import { TimeSpan } from '@app/classes/time/timespan';
import { MatDialogClose, MatDialogModule } from '@angular/material/dialog';
import { SessionService } from '@app/services/session/session.service';

describe('EndGameComponent', () => {
    let component: EndGameComponent;
    let fixture: ComponentFixture<EndGameComponent>;
    const gameService = {
        stats: {
            localStats: {
                points: 0,
                rackSize: 0,
            },
            remoteStats: {
                points: 0,
                rackSize: 0,
            },
        },
    };
    const sessionService = {
        gameConfig: {
            gameType: 'qwerty',
            playTime: TimeSpan.fromMinutesSeconds(1, 0),
            firstPlayerName: 'qwerty',
            secondPlayerName: 'uiop',
        },
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [EndGameComponent, MatDialogClose],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: GameService, useValue: gameService },
                { provide: SessionService, useValue: sessionService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EndGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show the right string if firstPlayer have more point when winner is called', () => {
        gameService.stats.localStats.points = 10;
        gameService.stats.remoteStats.points = 0;
        sessionService.gameConfig.firstPlayerName = 'Michel';
        sessionService.gameConfig.secondPlayerName = 'Jean-Simon';
        const message = component.winner();
        expect(message).toBe(
            'Félicitation au gagnant ' + sessionService.gameConfig.firstPlayerName + ':' + gameService.stats.localStats.points + ' points',
        );
    });

    it('should show the right string if secondPlayer have more point when winner is called', () => {
        gameService.stats.localStats.points = 0;
        gameService.stats.remoteStats.points = 10;
        sessionService.gameConfig.firstPlayerName = 'Michel';
        sessionService.gameConfig.secondPlayerName = 'Jean-Simon';
        const message = component.winner();
        expect(message).toBe(
            'Félicitation au gagnant ' + sessionService.gameConfig.secondPlayerName + ':' + gameService.stats.remoteStats.points + ' points',
        );
    });

    it('should show the right string if equality occurs when winner is called', () => {
        gameService.stats.localStats.points = 10;
        gameService.stats.remoteStats.points = 10;
        sessionService.gameConfig.firstPlayerName = 'Michel';
        sessionService.gameConfig.secondPlayerName = 'Jean-Simon';
        const message = component.winner();
        expect(message).toBe(
            'Félicitation aux gagnants ' +
                sessionService.gameConfig.firstPlayerName +
                ' et ' +
                sessionService.gameConfig.secondPlayerName +
                ' égalité',
        );
    });

    afterAll(() => cleanStyles());
});
