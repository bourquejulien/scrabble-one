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
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';

describe('BoardController', () => {
    let stubSessionHandlingService: SinonStubbedInstance<SessionHandlingService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        stubSessionHandlingService = createStubInstance(SessionHandlingService);

        const stubSessionHandler = createStubInstance(SessionHandler);
        const stubBoardHandler = createStubInstance(BoardHandler);
        stubSessionHandler['boardHandler'] = stubBoardHandler as unknown as BoardHandler;

        stubSessionHandlingService.getHandlerByPlayerId.returns(stubSessionHandler as unknown as SessionHandler);

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

    it('POST /validate/123 when there is a placement array', async () => {
        const placement: Placement[] = [{ letter: 'A', position: { x: 8, y: 8 } }];
        request(expressApp)
            .post('/api/board/validate/123')
            .send(placement)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            })
            .catch((err) => expect(err).to.be.undefined);
    });

    it('POST /validate/123 when there is no placement array', async () => {
        request(expressApp)
            .post('/api/board/validate/123')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            })
            .catch((err) => expect(err).to.be.undefined);
    });

    it('POST /retrieve/123', async () => {
        request(expressApp)
            .get('/api/board/retrieve/123')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            })
            .catch((err) => expect(err).to.be.undefined);
    });
});
