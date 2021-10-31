/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { Constants } from '@app/constants';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { expect } from 'chai';
import { Player } from '@app/classes/player/player';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import request from 'supertest';
import { Container } from 'typedi';

describe('PlayerController', () => {
    let stubSessionHandlingService: SinonStubbedInstance<SessionHandlingService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        stubSessionHandlingService = createStubInstance(SessionHandlingService);
        const stubSessionHandler = createStubInstance(SessionHandler);
        const player1: Player = { id: '1', isTurn: false, playerInfo: { id: '1', isHuman: false, name: 'Monique' } } as Player;
        const player2: Player = { id: '2', isTurn: false, playerInfo: { id: '2', isHuman: true, name: 'Monique' } } as Player;
        stubSessionHandler['players'] = [player1, player2];
        stubSessionHandlingService.getHandlerByPlayerId.returns(stubSessionHandler as unknown as SessionHandler);

        const app = Container.get(Application);
        Object.defineProperty(app['playerController'], 'sessionHandlingService', { value: stubSessionHandlingService });
        expressApp = app.app;
    });

    it('POST /api/player/exchange/  ', async () => {
        const exchange = ['words', 'are', 'great'];
        request(expressApp)
            .post('/api/player/exchange/1')
            .send(exchange)
            .expect(Constants.HTTP_STATUS.OK)
            .then((response) => {
                expect(response.body).to.be.equal('');
            });
    });

    it('POST /api/player/skip/  ', async () => {
        request(expressApp)
            .post('/api/player/skip/1')
            .expect(Constants.HTTP_STATUS.OK)
            .then((response) => {
                expect(response.body).to.be.equal('');
            });
    });

    it('GET /api/player/retrieve/  ', async () => {
        request(expressApp)
            .get('/api/player/retrieve/1')
            .expect(Constants.HTTP_STATUS.OK)
            .then((response) => {
                expect(response.body).to.be.equal('');
            });
    });
});
