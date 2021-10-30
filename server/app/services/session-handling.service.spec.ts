/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions -- Needed for chai library assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board } from '@app/classes/board/board';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { SessionInfo } from '@app/classes/session-info';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { expect } from 'chai';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { createStubInstance } from 'sinon';
import { IPlayer } from '@app/classes/player/player';
import { PlayerData } from '@app/classes/player-data';
import { BehaviorSubject } from 'rxjs';
import { PlayerInfo } from '@app/classes/player-info';

const MAX_HANDLERS = 5;
const BOARD_SIZE = 5;
const TIME_MS = 1000;
const DEFAULT_PLAYER_INFO: PlayerInfo = { id: 'test', name: 'tester', isHuman: false };
const DEFAULT_PLAYER_INFO_SECOND: PlayerInfo = { id: 'test2', name: 'tester2', isHuman: true };

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
describe('SessionHandlingService', () => {
    const service = new SessionHandlingService();
    const reserveHandler = new ReserveHandler();
    const board = new Board(BOARD_SIZE);
    const boardValidatorStub = createStubInstance(BoardValidator) as unknown as BoardValidator;
    const boardHandler = new BoardHandler(board, boardValidatorStub);

    beforeEach(() => {
        //
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should not remove handlers when theres none', () => {
        service.removeHandler('0');
        expect(service.removeHandler).to.be.null;
    });

    it('should add handlers', () => {
        for (let id = 0; id < MAX_HANDLERS; id++) {
            const idAsString: string = id.toString();
            const sessionInfo: SessionInfo = { id: idAsString, playTimeMs: TIME_MS, gameType: 'test' };
            const players: PlayerMock[] = [new PlayerMock(DEFAULT_PLAYER_INFO), new PlayerMock(DEFAULT_PLAYER_INFO_SECOND)];
            service.addHandler(new SessionHandler(sessionInfo, boardHandler, reserveHandler, players));
            expect(service.getHandler(idAsString)).to.be.not.null;
        }
    });
    it('should remove handlers when theres some', () => {
        const sessionInfo: SessionInfo = { id: '0', playTimeMs: TIME_MS, gameType: 'test' };
        const players: PlayerMock[] = [new PlayerMock(DEFAULT_PLAYER_INFO), new PlayerMock(DEFAULT_PLAYER_INFO_SECOND)];
        service.addHandler(new SessionHandler(sessionInfo, boardHandler, reserveHandler, players));
        service.removeHandler('0');
        expect(service.getHandler('0')).to.be.null;
    });
    it('should get handler', () => {
        const handler: SessionHandler | null = service.getHandler('0');
        expect(handler?.sessionInfo.id).to.equal('0');
    });
});
