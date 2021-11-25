/* eslint-disable dot-notation -- Need access to private functions and properties*/
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { TimeSpan } from '@app/classes/time/timespan';
import { SessionService } from '@app/services/session/session.service';
import { GameMode, GameType } from '@common';

describe('SessionService', () => {
    let service: SessionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SessionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set gameConfig if serverConfig provided', () => {
        const gameConfig = {
            gameType: GameType.SinglePlayer,
            playTime: TimeSpan.fromMilliseconds(6),
            firstPlayerName: 'A',
            secondPlayerName: 'B',
        };

        service['_gameConfig'] = gameConfig;

        const serverConfig = {
            id: '1',
            startId: '2',
            gameMode: GameMode.Classic,
            gameType: GameType.Multiplayer,
            playTimeMs: 5,
            firstPlayerName: 'Ligma',
            secondPlayerName: 'Alphonse',
        };

        service.serverConfig = serverConfig;
        expect(service.gameConfig.firstPlayerName).toBe(serverConfig.firstPlayerName);
        expect(service.gameConfig.secondPlayerName).toBe(serverConfig.secondPlayerName);
        expect(service.gameConfig.gameType).toBe(serverConfig.gameType);
    });
});
