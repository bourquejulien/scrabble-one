/* eslint-disable @typescript-eslint/no-unused-expressions,no-unused-expressions,dot-notation */
import { PlayerInfo } from '@app/classes/player-info';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { expect } from 'chai';
import Sinon, { createStubInstance } from 'sinon';
import { VirtualPlayerExpert } from '@app/classes/player/virtual-player/virtual-player-expert/virtual-player-expert';
import { Action } from '@app/classes/player/virtual-player/actions/action';
import { PlayActionExpert } from '@app/classes/player/virtual-player/virtual-player-expert/actions/play-action-expert';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { Board } from '@app/classes/board/board';
import { SessionStatsHandler } from '@app/handlers/stats-handlers/session-stats-handler/session-stats-handler';

const BOARD_SIZE = 15;

describe('VirtualPlayerExpert', () => {
    let service: VirtualPlayerExpert;

    let dictionaryService: Sinon.SinonStubbedInstance<DictionaryService>;
    let reserveHandler: Sinon.SinonStubbedInstance<ReserveHandler>;
    let socketHandler: Sinon.SinonStubbedInstance<SocketHandler>;
    let boardHandler: Sinon.SinonStubbedInstance<BoardHandler>;
    let statsHandler: Sinon.SinonStubbedInstance<SessionStatsHandler>;

    let playerInfo: PlayerInfo = { id: 'test', name: 'mauricetest', isHuman: false };
    let runAction: (action: Action) => Action | null;

    beforeEach(() => {
        dictionaryService = createStubInstance(DictionaryService);
        reserveHandler = createStubInstance(ReserveHandler);
        socketHandler = createStubInstance(SocketHandler);
        boardHandler = createStubInstance(BoardHandler);
        statsHandler = createStubInstance(SessionStatsHandler);
        playerInfo = { id: 'test', name: 'mauricetest', isHuman: false };
        runAction = () => null;

        boardHandler['board'] = new Board(BOARD_SIZE);

        service = new VirtualPlayerExpert(dictionaryService as unknown as DictionaryService, playerInfo, runAction);
        service.init(
            boardHandler as unknown as BoardHandler,
            reserveHandler,
            socketHandler as unknown as SocketHandler,
            statsHandler as unknown as SessionStatsHandler,
        );
    });

    it('should create', () => {
        expect(service).to.be.ok;
    });

    it('should return PlayActionExpert', () => {
        expect(service['nextAction']()).to.be.instanceof(PlayActionExpert);
    });
});
