/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { Constants } from '@app/constants';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { SessionHandlingService } from '@app/services/session-handling/session-handling.service';
import { expect } from 'chai';
import { Player } from '@app/classes/player/player';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import request from 'supertest';
import { Container } from 'typedi';
import { HumanPlayer } from '@app/classes/player/human-player/human-player';
import { Answer, Placement } from '@common';

describe('PlayerController', () => {
    let stubSessionHandlingService: SinonStubbedInstance<SessionHandlingService>;
    let expressApp: Express.Application;
    const exchangeLettersResponse = 'ExchangeLetterResponse';
    const placeLettersAnswer: Answer<unknown> = { isSuccess: true, payload: 'Not your turn' };
    const rack = ['m', 'e', 't', 'a'];

    beforeEach(async () => {
        stubSessionHandlingService = createStubInstance(SessionHandlingService);
        const stubSessionHandler = createStubInstance(SessionHandler);

        const player1: Player = {
            id: '1',
            isTurn: false,
            playerInfo: { id: '1', isHuman: true, name: 'Monique' },
            rack,
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
            placeLetters: () => {
                return placeLettersAnswer;
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

    it('POST /place/123 without valid user', async () => {
        const placement: Placement[] = [{ letter: 'A', position: { x: 8, y: 8 } }];
        return request(expressApp)
            .post('/api/player/place/123')
            .send(placement)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.BAD_REQUEST);
            });
    });

    it('POST /place/2 with valid user', async () => {
        const placement: Placement[] = [{ letter: 'A', position: { x: 8, y: 8 } }];
        return request(expressApp)
            .post('/api/player/place/2')
            .send(placement)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });

    it('POST /api/player/exchange/2   ', async () => {
        const exchange = ['words', 'are', 'great'];
        return request(expressApp)
            .post('/api/player/exchange/2')
            .send(exchange)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });

    it('POST /api/player/exchange/3 should not exchange for non-human players  ', async () => {
        const exchange = ['words', 'are', 'great'];
        return request(expressApp)
            .post('/api/player/exchange/3')
            .send(exchange)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.BAD_REQUEST);
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
});
