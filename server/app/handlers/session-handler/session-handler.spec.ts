/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { SessionInfo } from '@app/classes/session-info';
import { GameType } from '@common';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { SessionHandler } from './session-handler';
const TIME_MS = 1000;
/*
export class PlayerMock implements IPlayer {
    // Will be removed
    id: string;
    playerData: PlayerData;
    readonly turnEnded: BehaviorSubject<string>;
    constructor(readonly playerInfo: PlayerInfo) {
        this.playerInfo = playerInfo;
    }
    async startTurn(): Promise<void> {
        // Does Nothing
    }
    endTurn(): void {
        // Does Nothing
    }
    fillRack(): void {
        // Does Nothing
    }
}
*/
describe('SessionHandler', () => {
    let handler: SessionHandler;
    const sessionInfo: SessionInfo = {
        id: 'myUserId',
        playTimeMs: 120 * 1000,
        gameType: GameType.SinglePlayer,
    };
    before(() => {
        const stubBoardHandler = createStubInstance(BoardHandler) as unknown as BoardHandler;
        const stubReserveHandler: SinonStubbedInstance<ReserveHandler> = createStubInstance(ReserveHandler);
        const stubSocketHandler = createStubInstance(SocketHandler) as unknown as SocketHandler;
        handler = new SessionHandler(sessionInfo, stubBoardHandler, stubReserveHandler, stubSocketHandler) as unknown as SessionHandler;
    });

    it('should be created', () => {
        expect(handler).to.be.ok;
    });
    it('should return a good server config', () => {
        const returnValue = handler.getServerConfig('0');
        const expectedServerConfig: ServerGameConfig = {
            id: '0',
            gameType: 'test',
            playTimeMs: TIME_MS,
            firstPlayerName: 'tester',
            secondPlayerName: 'tester2',
        };
        expect(returnValue).to.eql(expectedServerConfig);
    });
});
