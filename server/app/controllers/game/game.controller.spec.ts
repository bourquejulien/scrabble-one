/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { Constants } from '@app/constants';
import { GameService } from '@app/services/game/game.service';
import { GameType, ServerConfig, SinglePlayerConfig } from '@common';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import request from 'supertest';
import { Container } from 'typedi';

describe('GameController', () => {
    let gameService: SinonStubbedInstance<GameService>;
    let expressApp: Express.Application;

    const multiplayerConfig = 'multiplayerConfig';

    const singlePlayerConfig: SinglePlayerConfig = {
        gameType: GameType.SinglePlayer,
        playTimeMs: 120 * 1000,
        playerName: 'Claudette',
        virtualPlayerName: 'Alphonse',
        isRandomBonus: true,
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
        gameService.initMultiplayer.resolves(multiplayerConfig);
        gameService.joinMultiplayer.resolves(serverConfig);
        const app = Container.get(Application);
        Object.defineProperty(app['gameController'], 'gameService', { value: gameService, writable: true });
        expressApp = app.app;
    });

    it('PUT /init/single', async () => {
        gameService.initSinglePlayer.resolves(serverConfig);
        return request(expressApp)
            .put('/api/game/init/single')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });

    it('PUT /init/single', async () => {
        gameService.initSinglePlayer.resolves({} as unknown as ServerConfig);
        return request(expressApp)
            .put('/api/game/init/single')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal({});
            });
    });

    it('PUT /convert', async () => {
        gameService.convert.resolves(serverConfig);
        return request(expressApp)
            .put('/api/game/convert')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal(serverConfig);
            });
    });

    it('PUT /init/multi succesfully', async () => {
        return request(expressApp)
            .put('/api/game/init/multi')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal(multiplayerConfig);
            });
    });

    it('PUT /init/multi should work when there is no user', async () => {
        gameService.initMultiplayer.resolves({} as unknown as string);
        return request(expressApp)
            .put('/api/game/init/multi')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal({});
            });
    });

    it('PUT /join successfully', async () => {
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
        gameService.joinMultiplayer.resolves({} as unknown as ServerConfig);
        return request(expressApp)
            .put('/api/game/join')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });
});
