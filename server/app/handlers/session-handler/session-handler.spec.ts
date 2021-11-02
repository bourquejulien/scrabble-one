/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { SessionInfo } from '@app/classes/session-info';
import { GameType, ServerConfig } from '@common';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { SessionHandler } from './session-handler';
import { Player } from '@app/classes/player/player';
import { PlayerData } from '@app/classes/player-data';
import { PlayerInfo } from '@app/classes/player-info';
import { Observable } from 'rxjs';
const TIME_MS = 120*1000;

export class PlayerMock implements Player {
    // Will be removed
    isTurn: boolean;
    id: string;
    playerInfo: PlayerInfo;
    playerData: PlayerData;
    constructor(playerInfo: PlayerInfo){
        this.playerInfo = playerInfo;
    }
    async startTurn(): Promise<void> {
        // Does Nothing
    }
    onTurn(): Observable<string>{
        // Does Nothing
        return new Observable();
    }
    fillRack(): void {
        // Does Nothing
    }
    // eslint-disable-next-line no-unused-vars
    init(boardHandler: BoardHandler, reserveHandler: ReserveHandler, socketHandler: SocketHandler): void {
        // Does nothing
    };
}

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
    //
    it('should return a good server config', () => {
        const playersInfos: PlayerInfo = {id:'myUserId', name:'tester', isHuman:true };
        handler.addPlayer(new PlayerMock(playersInfos));
        handler.addPlayer(new PlayerMock(playersInfos));
        const returnValue = handler.getServerConfig('myUserId');
        const expectedServerConfig: ServerConfig = {
            id: 'myUserId',
            gameType: GameType.SinglePlayer,
            playTimeMs: TIME_MS,
            firstPlayerName: 'tester',
            secondPlayerName: 'tester',
        };
        expect(returnValue).to.eql(expectedServerConfig);
    });
});
