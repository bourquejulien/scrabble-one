/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { Constants } from '@app/constants';
import { GameService } from '@app/services/game/game.service';
import { DictionaryMetadata, GameType, MultiplayerCreateConfig, ServerConfig, SinglePlayerConfig } from '@common';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import request from 'supertest';
import { Container } from 'typedi';

describe('GameController', () => {
    let gameService: SinonStubbedInstance<GameService>;
    let expressApp: Express.Application;

    const dictionary: DictionaryMetadata = {
        description: 'Blablabla',
        id: 'dictionary.json',
        nbWords: 1024,
        title: 'My cool dictionary',
    };

    const multiplayerConfig = 'multiplayerConfig';

    const singlePlayerConfig: SinglePlayerConfig = {
        gameType: GameType.SinglePlayer,
        playTimeMs: 120 * 1000,
        playerName: 'Claudette',
        virtualPlayerName: 'Alphonse',
        isRandomBonus: true,
        dictionary,
    };

    const multiplayerCreateConfig: MultiplayerCreateConfig = {
        gameType: GameType.SinglePlayer,
        playTimeMs: 120 * 1000,
        playerName: 'Claudette',
        isRandomBonus: true,
        dictionary,
    };

    const serverConfig: ServerConfig = {
        firstPlayerName: 'Alphonse',
        secondPlayerName: 'Monique',
        gameType: GameType.Multiplayer,
        id: '1234567890',
        playTimeMs: 120 * 1000,
        startId: 'startId',
    };

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        const app = Container.get(Application);
        Object.defineProperty(app['gameController'], 'gameService', { value: gameService, writable: true });
        expressApp = app.app;
    });

    it('PUT /init/single should succeed', async () => {
        gameService.initSinglePlayer.resolves(serverConfig);
        return request(expressApp)
            .put('/api/game/init/single')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal(serverConfig);
            });
    });

    it('PUT /init/single should fail', async () => {
        gameService.initSinglePlayer.rejects('serverConfig');
        return request(expressApp)
            .put('/api/game/init/single')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.NOT_FOUND);
                expect(response.body).to.deep.equal({});
            });
    });

    it('PUT /convert should succeed', async () => {
        gameService.convert.resolves(serverConfig);
        return request(expressApp)
            .put('/api/game/convert')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal(serverConfig);
            });
    });

    it('PUT /convert should fail', async () => {
        gameService.convert.rejects(serverConfig);
        return request(expressApp)
            .put('/api/game/convert')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.NOT_FOUND);
                expect(response.body).to.deep.equal({});
            });
    });

    it('PUT /init/multi should succeed', async () => {
        gameService.initMultiplayer.resolves(multiplayerConfig);
        return request(expressApp)
            .put('/api/game/init/multi')
            .send(multiplayerCreateConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal(multiplayerConfig);
            });
    });

    it('PUT /init/multi should fail', async () => {
        gameService.initMultiplayer.rejects('');
        return request(expressApp)
            .put('/api/game/init/multi')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.NOT_FOUND);
                expect(response.body).to.deep.equal({});
            });
    });

    it('PUT /join should succeed', async () => {
        gameService.joinMultiplayer.resolves(serverConfig);
        return request(expressApp)
            .put('/api/game/join')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal(serverConfig);
            });
    });

    it('PUT /join not join the game', async () => {
        gameService.joinMultiplayer.rejects(serverConfig);
        return request(expressApp)
            .put('/api/game/join')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.NOT_FOUND);
                expect(response.body).to.deep.equal({});
            });
    });
});
