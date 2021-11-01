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
import { Answer, Placement } from '@common';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { HumanPlayer } from '@app/classes/player/human-player/human-player';
import { Player } from '@app/classes/player/player';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';

describe('BoardController', () => {
    let stubSessionHandlingService: SinonStubbedInstance<SessionHandlingService>;
    let expressApp: Express.Application;
    let stubSessionHandler: SinonStubbedInstance<SessionHandler>;
    const placeLettersAnswer: Answer = { isSuccess: true, body: 'Not your turn' };

    beforeEach(async () => {
        stubSessionHandlingService = createStubInstance(SessionHandlingService);

        stubSessionHandler = createStubInstance(SessionHandler);
        const stubBoardHandler = createStubInstance(BoardHandler);
        stubSessionHandler['boardHandler'] = stubBoardHandler as unknown as BoardHandler;
        const player1: Player = { id: '1', isTurn: false, playerInfo: { id: '1', isHuman: false, name: 'Monique' } } as Player;
        const player2: HumanPlayer = {
            id: '2',
            isTurn: false,
            playerInfo: { id: '2', isHuman: true, name: 'Monique' },
            playerData: {
                rack: ['m', 'e', 't', 'a'],
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            exchangeLetters: () => {},
            placeLetters: () => {
                return placeLettersAnswer;
            },
        } as unknown as HumanPlayer;
        const stubPlayerHandler = createStubInstance(PlayerHandler) as unknown as PlayerHandler;
        stubPlayerHandler['players'] = [player1, player2];

        stubSessionHandler['playerHandler'] = stubPlayerHandler;
        stubSessionHandlingService.getHandlerByPlayerId.returns(stubSessionHandler as unknown as SessionHandler);

        const app = Container.get(Application);
        Object.defineProperty(app['boardController'], 'sessionHandlingService', { value: stubSessionHandlingService });
        expressApp = app.app;
    });

    it('POST /place/123 without valid user', async () => {
        const placement: Placement[] = [{ letter: 'A', position: { x: 8, y: 8 } }];
        return request(expressApp)
            .post('/api/board/place/123')
            .send(placement)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });

    it('POST /place/2 with valid user', async () => {
        const placement: Placement[] = [{ letter: 'A', position: { x: 8, y: 8 } }];
        return request(expressApp)
            .post('/api/board/place/2')
            .send(placement)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });

    it('POST /validate/123 when there is a placement array', async () => {
        const placement: Placement[] = [{ letter: 'A', position: { x: 8, y: 8 } }];
        return request(expressApp)
            .post('/api/board/validate/123')
            .send(placement)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });

    it('POST /validate/1 when there is no boardHandler', async () => {
        stubSessionHandlingService.getHandlerByPlayerId.returns(null);
        const placement: Placement[] = [{ letter: 'A', position: { x: 8, y: 8 } }];
        return request(expressApp)
            .post('/api/board/validate/123')
            .send(placement)
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.BAD_REQUEST);
            });
    });

    it('POST /retrieve/123 when there is no boardHandler', async () => {
        stubSessionHandlingService.getHandlerByPlayerId.returns(null);
        return request(expressApp)
            .get('/api/board/retrieve/123')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });

    /* it('POST /retrieve/1 successfully  ', async () => {
        const stubBoardHandler = createStubInstance(BoardHandler);
        stubBoardHandler['board'] = createStubInstance(Board, { boardData: { board: [], filledPositions: [] } }) as unknown as Board;
        stubSessionHandler['boardHandler'] = stubBoardHandler as unknown as BoardHandler;

        return request(expressApp)
            .get('/api/board/retrieve/1')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    }); */

    it('POST /retrieve/1 ', async () => {
        return request(expressApp)
            .get('/api/board/retrieve/1')
            .then((response) => {
                expect(response.status).to.be.equal(Constants.HTTP_STATUS.OK);
            });
    });
});
