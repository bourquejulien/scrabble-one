/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { SessionInfo } from '@app/classes/session-info';
import { GameType } from '@common';
import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { SessionHandler } from './session-handler';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';
import { Subject } from 'rxjs';

describe('SessionHandler', () => {
    let handler: SessionHandler;
    let turnSubject: Subject<string>;

    const sessionInfo: SessionInfo = {
        id: 'myUserId',
        playTimeMs: 120 * 1000,
        gameType: GameType.SinglePlayer,
    };

    before(() => {
        turnSubject = new Subject<string>();

        const stubBoardHandler = createStubInstance(BoardHandler);
        const stubReserveHandler = createStubInstance(ReserveHandler);
        const stubSocketHandler = createStubInstance(SocketHandler);
        const stubPlayerHandler = createStubInstance(PlayerHandler);

        stubPlayerHandler.onTurn.returns(turnSubject.asObservable());

        handler = new SessionHandler(
            sessionInfo,
            stubBoardHandler as unknown as BoardHandler,
            stubReserveHandler as unknown as ReserveHandler,
            stubPlayerHandler as unknown as PlayerHandler,
            stubSocketHandler as unknown as SocketHandler,
        ) as unknown as SessionHandler;
    });

    it('should be created', () => {
        expect(handler).to.be.ok;
    });
});
