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

    beforeEach(async () => {
        stubSessionHandlingService = createStubInstance(SessionHandlingService);
        const stubSessionHandler = createStubInstance(SessionHandler);
        stubSessionHandler.getStats.returns(sessionStats);

        const player1: Player = { id: '1', isTurn: false, playerInfo: { id: '1', isHuman: true, name: 'Monique' } } as Player;
        const player2: HumanPlayer = {
            id: '2',
            isTurn: false,
            playerInfo: { id: '2', isHuman: true, name: 'Claudette' },
            playerData: {
                rack: ['m', 'e', 't', 'a'],
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            skipTurn: () => {},
            exchangeLetters: () => {
                return 'ExchangeLetterResponse';
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

    it('POST /api/player/exchange/2  ', async () => {
        const exchange = ['words', 'are', 'great'];
        request(expressApp)
            .post('/api/player/exchange/2')
            .send(exchange)
            .expect(Constants.HTTP_STATUS.OK)
            .then((response) => {
                expect(response.body).to.be.equal('');
            });
    });

    it('POST /api/player/exchange/3  ', async () => {
        const exchange = ['words', 'are', 'great'];
        request(expressApp)
            .post('/api/player/exchange/3')
            .send(exchange)
            .expect(Constants.HTTP_STATUS.OK)
            .then((response) => {
                expect(response.body).to.be.equal('');
            });
    });

    it('POST /api/player/skip/ skip humanPlayer turn  ', async () => {
        request(expressApp)
            .post('/api/player/skip/2')
            .expect(Constants.HTTP_STATUS.OK)
            .then((response) => {
                expect(response.body).to.be.equal('');
            });
    });

    it('#getHumanPlayer should return null ', async () => {
        stubSessionHandlingService.getHandlerByPlayerId.returns(null);
        request(expressApp)
            .post('/api/player/skip/1')
            .expect(Constants.HTTP_STATUS.OK)
            .then((response) => {
                expect(response.body).to.be.equal('');
            });
    });

    it('GET /api/player/rack/3  ', async () => {
        request(expressApp)
            .get('/api/player/rack/3')
            .expect(Constants.HTTP_STATUS.OK)
            .then((response) => {
                expect(response.body).to.be.equal('');
            });
    });

    it('GET /api/player/rack/2  ', async () => {
        request(expressApp)
            .get('/api/player/rack/1')
            .expect(Constants.HTTP_STATUS.OK)
            .then((response) => {
                expect(response.body).to.be.equal('');
            });
    });

    it('GET /api/player/rack/1  ', async () => {
        request(expressApp)
            .get('/api/player/rack/1')
            .expect(Constants.HTTP_STATUS.OK)
            .then((response) => {
                expect(response.body).to.be.equal('');
            });
    });

    it('GET /api/player/stats/2  ', async () => {
        request(expressApp)
            .get('/api/player/stats/2')
            .expect(Constants.HTTP_STATUS.OK)
            .then((response) => {
                expect(response.body).to.be.equal('');
            });
    });

    it('GET /api/player/stats/123 should error out  ', async () => {
        stubSessionHandlingService.getHandlerByPlayerId.returns(null);
        request(expressApp)
            .get('/api/player/stats/123')
            .expect(Constants.HTTP_STATUS.BAD_REQUEST)
            .then((response) => {
                expect(response.body).to.be.equal('');
            });
    });
});
