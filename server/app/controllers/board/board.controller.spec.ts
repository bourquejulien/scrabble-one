/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { Application } from '@app/app';
import { Constants } from '@app/constants';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import request from 'supertest';
import { Container } from 'typedi';
import { Placement } from '@common';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';

describe('BoardController', () => {
    let stubSessionHandlingService: SinonStubbedInstance<SessionHandlingService>;
    let expressApp: Express.Application;
    const stubReserve = ['a'];

    beforeEach(async () => {
        stubSessionHandlingService = createStubInstance(SessionHandlingService);

        const stubReserveHandler = createStubInstance(ReserveHandler);
        stubReserveHandler['reserve'] = stubReserve;

        const stubSessionHandler = createStubInstance(SessionHandler);
        stubSessionHandler['reserveHandler'] = stubReserveHandler;

        stubSessionHandlingService.getHandlerByPlayerId.returns(stubReserveHandler as unknown as SessionHandler);

        const app = Container.get(Application);
        Object.defineProperty(app['boardController'], 'sessionHandlingService', { value: stubSessionHandlingService });
        expressApp = app.app;
    });

    it('POST /place/123', async () => {
        const placement: Placement[] = [{ letter: 'A', position: { x: 8, y: 8 } }];
        request(expressApp)
            .post('/api/board/place/123')
            .send(placement)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            })
            .catch((err) => expect(err).to.be.undefined);
    });

    it('POST /validate/123', async () => {
        const placement: Placement[] = [{ letter: 'A', position: { x: 8, y: 8 } }];
        request(expressApp)
            .post('/api/board/validate/123')
            .send(placement)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            })
            .catch((err) => expect(err).to.be.undefined);
    });

    it('POST /retrieve/123', async () => {
        request(expressApp)
            .post('/api/board/retrieve/123')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            })
            .catch((err) => expect(err).to.be.undefined);
    });
});
