/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/*
import { SessionInfo } from '@app/classes/session-info';
import { GameType, ServerConfig } from '@common';
import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { SessionHandler } from './session-handler';
import { Player } from '@app/classes/player/player';
import { PlayerData } from '@app/classes/player-data';
import { PlayerInfo } from '@app/classes/player-info';
import { Observable, Subject } from 'rxjs';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';
const TIME_MS = 120 * 1000;


describe('SessionHandler', () => {
    let handler: SessionHandler;
    let turnSubject: Subject<string>;

    const sessionInfo: SessionInfo = {
        id: 'myUserId',
        playTimeMs: 120 * 1000,
        gameType: GameType.SinglePlayer,
    };

    beforeEach(() => {
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
    //
    it('should return a good server config', () => {
        handler.addPlayer(new Player['()']());
        handler.addPlayer(new Player['()']());
        handler.sessionInfo.id = 'myUserId';
        const returnValue = handler.getServerConfig('myUserId');
        const expectedServerConfig: ServerConfig = {
            id: '0',
            startId: 'myUserId',
            gameType: GameType.SinglePlayer,
            playTimeMs: TIME_MS,
            firstPlayerName: 'tester',
            secondPlayerName: 'tester',
        };
        expect(returnValue).to.eql(expectedServerConfig);
    });
});
*/
