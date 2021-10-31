/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { Constants } from '@app/constants';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import request from 'supertest';
import { Container } from 'typedi';

describe('PlayerController', () => {
    let stubSessionHandlingService: SinonStubbedInstance<SessionHandlingService>;
    let expressApp: Express.Application;
    const stubReserve = ['a'];

    before(() => {
        stubSessionHandlingService = createStubInstance(SessionHandlingService);

        const stubReserveHandler = createStubInstance(ReserveHandler);
        stubReserveHandler['reserve'] = stubReserve;

        const stubSessionHandler = createStubInstance(SessionHandler);
        stubSessionHandler['reserveHandler'] = stubReserveHandler;

        stubSessionHandlingService.getHandlerByPlayerId.returns(stubReserveHandler as unknown as SessionHandler);

        const app = Container.get(Application);
        Object.defineProperty(app['reserveController'], 'SessionHandlingService', { value: stubSessionHandlingService });
        expressApp = app.app;
    });

    it('GET /api/reserve/retrieve/ when reserve is empty ', async () => {
        request(expressApp)
            .get('/api/reserve/retrieve/123')
            .expect(Constants.HTTP_STATUS.OK)
            .then((response) => {
                expect(response.body).to.be.equal(JSON.stringify(stubReserve));
            });
    });
});
