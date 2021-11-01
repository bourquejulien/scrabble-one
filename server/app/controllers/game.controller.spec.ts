/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { GameService } from '@app/services/game/game.service';
import { GameType, ServerConfig } from '@common';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Container } from 'typedi';

describe('GameController', () => {
    let gameService: SinonStubbedInstance<GameService>;

    const serverConfig: ServerConfig = {
        firstPlayerName: 'Alphonse',
        secondPlayerName: 'Monique',
        gameType: GameType.Multiplayer,
        id: '1234567890',
        startId: '1234567890',
        playTimeMs: 120 * 1000,
    };

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        // Methods: gameService.
        gameService.initSinglePlayer.resolves(serverConfig);
        const app = Container.get(Application);
        Object.defineProperty(app['gameController'], 'gameService', { value: gameService, writable: true });
    });

    it('should be created', () => {
        expect(gameService).to.be.ok;
    });
});
