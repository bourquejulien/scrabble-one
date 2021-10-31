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

    const singlePlayerConfig: SinglePlayerConfig = {
        gameType: GameType.SinglePlayer,
        playTimeMs: 120 * 1000,
        playerName: 'Claudette',
        virtualPlayerName: 'Alphonse',
    };

    const serverConfig: ServerConfig = {
        firstPlayerName: 'Alphonse',
        secondPlayerName: 'Monique',
        gameType: GameType.Multiplayer,
        id: '1234567890',
        playTimeMs: 120 * 1000,
    };

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        // Methods: gameService.
        gameService.initMultiplayer.resolves(serverConfig);
        gameService.initSinglePlayer.resolves(serverConfig);
        const app = Container.get(Application);
        Object.defineProperty(app['gameController'], 'GameService', { value: gameService, writable: true });
        expressApp = app.app;
    });

    it('DELETE /stop', async () => {
        request(expressApp)
            .delete('/api/game/stop/123')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            })
            .catch((err) => expect(err).to.be.undefined);
    });

    it('GET /start', async () => {
        request(expressApp)
            .get('/api/game/start/123')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            })
            .catch((err) => expect(err).to.be.undefined);
    });

    it('PUT /init/single', async () => {
        request(expressApp)
            .put('/api/game/init/single')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            })
            .catch((err) => expect(err).to.be.undefined);
    });

    it('PUT /init/multi', async () => {
        request(expressApp)
            .put('/api/game/init/multi')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.text).to.be.equal(JSON.stringify(serverConfig));
            })
            .catch((err) => expect(err).to.be.undefined);
    });

    it('PUT /join', async () => {
        request(expressApp)
            .put('/api/game/join')
            .send(singlePlayerConfig)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            })
            .catch((err) => expect(err).to.be.undefined);
    });
});
