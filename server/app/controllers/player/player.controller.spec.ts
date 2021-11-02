/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { Constants } from '@app/constants';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { expect } from 'chai';
import { Player } from '@app/classes/player/player';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import request from 'supertest';
import { Container } from 'typedi';
import { HumanPlayer } from '@app/classes/player/human-player/human-player';
import { SessionStats } from '@common';

describe('PlayerController', () => {
    let stubSessionHandlingService: SinonStubbedInstance<SessionHandlingService>;
    let expressApp: Express.Application;
    const sessionStats: SessionStats = { localStats: { points: 100, rackSize: 5 }, remoteStats: { points: 200, rackSize: 1 } };
    const exchangeLettersResponse = 'ExchangeLetterResponse';
    const rack = ['m', 'e', 't', 'a'];
    beforeEach(async () => {
        stubSessionHandlingService = createStubInstance(SessionHandlingService);
        const stubSessionHandler = createStubInstance(SessionHandler);
        stubSessionHandler.getStats.returns(sessionStats);

        const player1: Player = {
            id: '1',
            isTurn: false,
            playerInfo: { id: '1', isHuman: true, name: 'Monique' },
            playerData: { rack },
        } as Player;
        const player2: HumanPlayer = {
            id: '2',
            isTurn: false,
            playerInfo: { id: '2', isHuman: true, name: 'Claudette' },
            playerData: {
                rack,
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            skipTurn: () => {},
            exchangeLetters: () => {
                return exchangeLettersResponse;
            },
        } as unknown as HumanPlayer;
        const player3: Player = { id: '1', isTurn: false, playerInfo: { id: '3', isHuman: false, name: 'Alphonse' } } as Player;
        const stubPlayerHandler = createStubInstance(PlayerHandler) as unknown as PlayerHandler;
        stubPlayerHandler['players'] = [player1, player2, player3];

        stubSessionHandler['playerHandler'] = stubPlayerHandler;
        stubSessionHandlingService.getHandlerByPlayerId.returns(stubSessionHandler as unknown as SessionHandler);

        const app = Container.get(Application);
        Object.defineProperty(app['playerController'], 'sessionHandlingService', { value: stubSessionHandlingService });
        expressApp = app.app;
    });

    it('POST /api/player/exchange/2   ', async () => {
        const exchange = ['words', 'are', 'great'];
        return request(expressApp)
            .post('/api/player/exchange/2')
            .send(exchange)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.be.equal(exchangeLettersResponse);
            });
    });

    it('POST /api/player/exchange/3 should not exchange for non-human players  ', async () => {
        const exchange = ['words', 'are', 'great'];
        return request(expressApp)
            .post('/api/player/exchange/3')
            .send(exchange)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.BAD_REQUEST);
                expect(response.body).to.deep.equal({});
            });
    });

    it('POST /api/player/skip/ skip humanPlayer turn  ', async () => {
        return request(expressApp)
            .post('/api/player/skip/2')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal('');
            });
    });

    it('#getHumanPlayer should return an error if there is no playerHandler ', async () => {
        stubSessionHandlingService.getHandlerByPlayerId.returns(null);
        return request(expressApp)
            .post('/api/player/skip/1')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.BAD_REQUEST);
                expect(response.body).to.deep.equal({});
            });
    });

    it('GET /api/player/rack/3 not get rack for non-human player ', async () => {
        return request(expressApp)
            .get('/api/player/rack/3')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.BAD_REQUEST);
                expect(response.body).to.deep.equal({});
            });
    });

    it('GET /api/player/rack/2 should return rack of human player ', async () => {
        return request(expressApp)
            .get('/api/player/rack/2')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal(rack);
            });
    });

    it('GET /api/player/rack/1 should return the rack of a non-human player', async () => {
        return request(expressApp)
            .get('/api/player/rack/1')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal(rack);
            });
    });

    it('GET /api/player/stats/2 should return the correct rack info of a human player ', async () => {
        return request(expressApp)
            .get('/api/player/stats/2')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal(sessionStats);
            });
    });

    it('GET /api/player/stats/123 should error out  ', async () => {
        stubSessionHandlingService.getHandlerByPlayerId.returns(null);
        return request(expressApp)
            .get('/api/player/stats/123')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.BAD_REQUEST);
            });
    });
});
