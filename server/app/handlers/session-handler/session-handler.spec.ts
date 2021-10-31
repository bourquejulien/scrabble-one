/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { SessionInfo } from '@app/classes/session-info';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ServerGameConfig } from '@common';
import { IPlayer } from '@app/classes/player/player';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SessionHandler } from './session-handler';
import { PlayerData } from '@app/classes/player-data';
import { BehaviorSubject } from 'rxjs';
import { PlayerInfo } from '@app/classes/player-info';
import { Board } from '@app/classes/board/board';
import { createStubInstance } from 'sinon';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { expect } from 'chai';

const TIME_MS = 1000;
const BOARD_SIZE = 5;
const SESSION_INFO: SessionInfo = { id: '0', playTimeMs: TIME_MS, gameType: 'test' };
const DEFAULT_PLAYER_INFO: PlayerInfo = { id: '0', name: 'tester', isHuman: false };
const DEFAULT_PLAYER_INFO_SECOND: PlayerInfo = { id: '0', name: 'tester2', isHuman: true };
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

describe('SessionHandler', () => {
    const reserveHandler = new ReserveHandler();
    const board = new Board(BOARD_SIZE);
    const boardValidatorStub = createStubInstance(BoardValidator) as unknown as BoardValidator;
    const boardHandler = new BoardHandler(board, boardValidatorStub);
    const players: PlayerMock[] = [new PlayerMock(DEFAULT_PLAYER_INFO), new PlayerMock(DEFAULT_PLAYER_INFO_SECOND)];
    const service = new SessionHandler(SESSION_INFO, boardHandler, reserveHandler, players);

    beforeEach(() => {
        //
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should return a good server config', () => {
        const returnValue = service.getServerConfig('0');
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
