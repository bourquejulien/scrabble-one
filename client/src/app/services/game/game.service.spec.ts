/* eslint-disable dot-notation -- Need to access private properties for testing*/
/* eslint-disable max-classes-per-file -- Needs many stubbed classes in order to test*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { EndGameWinner } from '@app/classes/end-game-winner';
import { GameConfig } from '@app/classes/game-config';
import { PlayerType } from '@app/classes/player/player-type';
import { TimeSpan } from '@app/classes/time/timespan';
import { GameService } from '@app/services/game/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { RackService } from '@app/services/rack/rack.service';
import { SessionService } from '@app/services/session/session.service';
import { GameType, ServerConfig, SessionStats } from '@common';
import { Observable, Subject } from 'rxjs';

class SessionServiceStub {
    private _id: string;
    private _gameConfig: GameConfig;
    get gameConfig(): GameConfig {
        return this._gameConfig;
    }
    get id(): string {
        return this._id;
    }
}

describe('GameService', () => {
    let service: GameService;
    let mockRack: string[];
    const session = new SessionServiceStub();

    let httpSpyObj: jasmine.SpyObj<HttpClient>;
    let playerServiceSpyObj: jasmine.SpyObj<PlayerService>;
    let rackServiceSpyObj: jasmine.SpyObj<RackService>;
    let serverConfigObservableSpyObj: jasmine.SpyObj<Observable<ServerConfig>>;
    let sessionStatsObservableSpyObj: jasmine.SpyObj<Observable<SessionStats>>;

    beforeEach(async () => {
        mockRack = ['K', 'E', 'S', 'E', 'I', 'O', 'V'];
        rackServiceSpyObj = jasmine.createSpyObj('RackService', ['update', 'refresh']);
        httpSpyObj = jasmine.createSpyObj('HttpModule', ['get', 'put']);
        sessionStatsObservableSpyObj = jasmine.createSpyObj('Observable<SessionStats>', ['toPromise']);
        serverConfigObservableSpyObj = jasmine.createSpyObj('Observable<ServerConfig>', ['toPromise']);
        httpSpyObj.put.and.returnValue(serverConfigObservableSpyObj);
        httpSpyObj.get.and.returnValue(sessionStatsObservableSpyObj);

        playerServiceSpyObj = jasmine.createSpyObj('playerService', ['startTurn', 'turnComplete', 'fillRack', 'reset', 'emptyRack', 'refresh'], {
            playerData: { score: 0, skippedTurns: 0, rack: [] },
            rack: mockRack,
            turnComplete: new Subject(),
        });
        playerServiceSpyObj.reset.and.returnValue();

        TestBed.configureTestingModule({
            imports: [],
            providers: [
                { provide: PlayerService, useValue: playerServiceSpyObj },
                { provide: RackService, useValue: rackServiceSpyObj },
                { provide: HttpClient, useValue: httpSpyObj },
                { provide: SessionService, useValue: session },
            ],
        });

        service = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should refresh', async () => {
        const stats = {
            localStats: { points: 10, rackSize: 7 },
            remoteStats: { points: 10, rackSize: 7 },
        };

        const expectedStats = {
            localStats: { points: 15, rackSize: 7 },
            remoteStats: { points: 15, rackSize: 7 },
        };

        service.stats = stats;
        const expectedSessionStats = expectedStats;
        sessionStatsObservableSpyObj.toPromise.and.resolveTo(expectedSessionStats);
        await service['refresh']();
        expect(service.stats).toBe(expectedSessionStats);
        expect(playerServiceSpyObj.refresh).toHaveBeenCalled();
        expect(rackServiceSpyObj.refresh).toHaveBeenCalled();
    });

    it('should start single player', async () => {
        const config = {
            gameType: GameType.SinglePlayer,
            playTimeMs: 1000,
            playerName: 'Monique',
            virtualPlayerName: 'Alphonse',
            isRandomBonus: false,
        };

        serverConfigObservableSpyObj.toPromise.and.resolveTo(config);
        const spy = spyOn(service, 'start').and.callThrough();
        await service.startSinglePlayer(config);
        expect(spy).toHaveBeenCalled();
    });

    it('should reset playerService', async () => {
        await service.reset();
        expect(playerServiceSpyObj.reset).toHaveBeenCalled();
    });

    // it('should refresh and change current turn if player type is not equal to current player', async () => {
    //     let sessionId = '2';
    //     session['_id'] = '1';
    //     let playerType = PlayerType.Local;
    //     service['currentTurn'] = PlayerType.Remote;

    //     const spy = spyOn<any>(service, 'refresh').and.callThrough();
    //     await service['onNextTurn'](sessionId);

    //     expect(spy).not.toHaveBeenCalled();
    //     expect(service['currentTurn']).toBe(playerType);
    //     // expect(service['onTurn'].next).toHaveBeenCalled();
    // });

    it('should not refresh and not change current turn if player type is equal to current player', async () => {
        const sessionId = '1';
        session['_id'] = '1';
        const playerType = PlayerType.Local;

        service['currentTurn'] = PlayerType.Local;
        const spy = spyOn<any>(service, 'refresh');

        await service['onNextTurn'](sessionId);
        spy.and.callThrough();
        expect(spy).not.toHaveBeenCalled();
        expect(service['currentTurn']).toBe(playerType);
    });

    it('should end game', async () => {
        const winnerId = '1';

        const gameConfig = {
            gameType: GameType.Multiplayer,
            playTime: TimeSpan.fromMinutesSeconds(1, 0),
            firstPlayerName: 'Alphonse',
            secondPlayerName: 'Monique',
        };

        const serverConfig = {
            id: '1',
            startId: '2',
            gameType: GameType.Multiplayer,
            playTimeMs: 1000,
            firstPlayerName: 'Monique',
            secondPlayerName: 'Alphonse',
        };

        session['_id'] = '1';
        session['_gameConfig'] = gameConfig;

        const spy = spyOn<any>(service, 'refresh');
        await service['start'](serverConfig);
        spy.and.callThrough();
        spyOn<any>(service, 'onNextTurn').and.callThrough();
        spy.and.callThrough();
        await service['endGame'](winnerId);
        spy.and.callThrough();
        expect(spy).toHaveBeenCalled();
        service['gameEnding'].next();
        expect(session['_gameConfig'].firstPlayerName).toBe(gameConfig.firstPlayerName);
    });

    it('should call gameEnding.next with EndGameWinner.Draw', async () => {
        const gameConfig = {
            gameType: GameType.Multiplayer,
            playTime: TimeSpan.fromMinutesSeconds(1, 0),
            firstPlayerName: 'Alphonse',
            secondPlayerName: 'Monique',
        };

        const winnerId = '';
        const winner = EndGameWinner.Draw;
        session['_gameConfig'] = gameConfig;

        const spy = spyOn<any>(service.gameEnding, 'next');
        await service['endGame'](winnerId);
        expect(spy).toHaveBeenCalledWith(winner);
    });

    it('should call gameEnding.next with EndGameWinner.Remote', async () => {
        const gameConfig = {
            gameType: GameType.Multiplayer,
            playTime: TimeSpan.fromMinutesSeconds(1, 0),
            firstPlayerName: 'Alphonse',
            secondPlayerName: 'Monique',
        };

        const winnerId = '1';
        const winner = EndGameWinner.Remote;
        session['_id'] = '2';
        session['_gameConfig'] = gameConfig;

        const spy = spyOn<any>(service.gameEnding, 'next');
        await service['endGame'](winnerId);
        expect(spy).toHaveBeenCalledWith(winner);
    });

    // it('should call gameEnding.next with EndGameWinner.Remote', async () => {
    //     let gameConfig = {
    //         gameType: GameType.Multiplayer,
    //         playTime: TimeSpan.fromMinutesSeconds(1, 0),
    //         firstPlayerName: 'Alphonse',
    //         secondPlayerName: 'Monique'
    //     }

    //     let id = '1';
    //     let playerType = PlayerType.Local;
    //     session['_id'] = '1';
    //     session['_gameConfig'] = gameConfig;

    //     const spy = spyOn<any>(service.onTurn, 'next');
    //     await service['onNextTurn'](id);
    //     expect(spy).toHaveBeenCalledWith(playerType);
    // });
});
