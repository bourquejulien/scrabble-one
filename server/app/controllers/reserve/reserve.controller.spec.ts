/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
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

describe('ReserveController', () => {
    let stubSessionHandlingService: SinonStubbedInstance<SessionHandlingService>;
    let expressApp: Express.Application;
    const stubReserve = ['a'];

    beforeEach(() => {
        stubSessionHandlingService = createStubInstance(SessionHandlingService);

        const stubReserveHandler = createStubInstance(ReserveHandler);
        stubReserveHandler['reserve'] = stubReserve;

        const stubSessionHandler = createStubInstance(SessionHandler);
        stubSessionHandler['reserveHandler'] = stubReserveHandler;

        stubSessionHandlingService.getHandlerByPlayerId.returns(stubSessionHandler as unknown as SessionHandler);

        const app = Container.get(Application);
        Object.defineProperty(app['reserveController'], 'sessionHandlingService', { value: stubSessionHandlingService, writable: true });
        expressApp = app.app;
    });

    it('should be created', () => {
        expect(stubSessionHandlingService).to.be.ok;
        expect(expressApp).to.be.ok;
    });

    it('GET /reserve/retrieve/  ', async () => {
        return request(expressApp)
            .get('/api/reserve/retrieve/1')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
                expect(response.body).to.deep.equal(stubReserve);
            });
    });

    it('GET /reserve/retrieve/ fail when there is no player with this id ', async () => {
        stubSessionHandlingService.getHandlerByPlayerId.returns(null);
        return request(expressApp)
            .get('/api/reserve/retrieve/123')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.BAD_REQUEST);
                expect(response.body).to.deep.equal({});
            });
    });
});
