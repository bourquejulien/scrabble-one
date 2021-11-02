/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions -- Needed for chai library assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board } from '@app/classes/board/board';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { SessionInfo } from '@app/classes/session-info';
import { expect } from 'chai';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { createStubInstance } from 'sinon';
import { Player } from '@app/classes/player/player';
import { PlayerData } from '@app/classes/player-data';
import { Observable } from 'rxjs';
import { PlayerInfo } from '@app/classes/player-info';
import { SessionHandlingService } from './session-handling.service';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { SocketService } from '@app/services/socket/socket-service';
import { GameType } from '@common';

const MAX_HANDLERS = 5;
const BOARD_SIZE = 5;
const TIME_MS = 1000;

export class PlayerMock implements Player {
    // Will be removed
    isTurn: boolean;
    id: string;
    playerInfo: PlayerInfo;
    playerData: PlayerData;
    async startTurn(): Promise<void> {
        // Does Nothing
    }
    onTurn(): Observable<string> {
        // Does Nothing
        return new Observable();
    }
    fillRack(): void {
        // Does Nothing
    }
    // eslint-disable-next-line no-unused-vars
    init(boardHandler: BoardHandler, reserveHandler: ReserveHandler, socketHandler: SocketHandler): void {
        // Does nothing
    }
}
describe('SessionHandlingService', () => {
    const service = new SessionHandlingService();
    const reserveHandler = new ReserveHandler();
    const board = new Board(BOARD_SIZE);
    const boardValidatorStub = createStubInstance(BoardValidator) as unknown as BoardValidator;
    const boardHandler = new BoardHandler(board, boardValidatorStub);
    const socketService = new SocketService();
    const socketHandler = new SocketHandler(socketService);
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
            const sessionInfo: SessionInfo = { id: idAsString, playTimeMs: TIME_MS, gameType: GameType.Multiplayer };
            service.addHandler(new SessionHandler(sessionInfo, boardHandler, reserveHandler, socketHandler));
            expect(service.getHandlerBySessionId(idAsString)).to.be.not.null;
        }
    });
    it('should remove handlers when theres some', () => {
        const sessionInfo: SessionInfo = { id: '0', playTimeMs: TIME_MS, gameType: GameType.Multiplayer };
        const sessHandler = new SessionHandler(sessionInfo, boardHandler, reserveHandler, socketHandler);
        sessHandler.addPlayer(new PlayerMock());
        sessHandler.addPlayer(new PlayerMock());
        service.addHandler(new SessionHandler(sessionInfo, boardHandler, reserveHandler, socketHandler));
        service.removeHandler('0');
        expect(service.getHandlerBySessionId('0')).to.be.null;
    });
    it('should get handler', () => {
        const handler: SessionHandler | null = service.getHandlerBySessionId('0');
        expect(handler?.sessionInfo.id).to.equal('0');
    });
});
