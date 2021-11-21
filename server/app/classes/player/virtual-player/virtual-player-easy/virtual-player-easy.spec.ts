/* eslint-disable dot-notation,@typescript-eslint/no-unused-expressions,no-unused-expressions */
import { PlayerInfo } from '@app/classes/player-info';
import { VirtualPlayerEasy } from '@app/classes/player/virtual-player/virtual-player-easy/virtual-player-easy';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { expect } from 'chai';
import Sinon, { createSandbox, createStubInstance, SinonSandbox } from 'sinon';
import { Board } from '@app/classes/board/board';
import { SkipAction } from '@app/classes/player/virtual-player/actions/skip-action';
import { ExchangeAction } from '@app/classes/player/virtual-player/actions/exchange-action';
import { PlayActionEasy } from '@app/classes/player/virtual-player/virtual-player-easy/actions/play-action-easy';
import { Action } from '@app/classes/player/virtual-player/actions/action';
import { SessionStatsHandler } from '@app/handlers/stats-handlers/session-stats-handler/session-stats-handler';

const RANDOM_RETURN_EXCHANGE = 0.09;
const RANDOM_RETURN_SKIP = 0.11;
const RANDOM_RETURN_PLAY = 0.21;

const BOARD_SIZE = 15;

describe('VirtualPlayerEasy', () => {
    let service: VirtualPlayerEasy;

    let reserveHandler: Sinon.SinonStubbedInstance<ReserveHandler>;
    let dictionaryService: Sinon.SinonStubbedInstance<DictionaryService>;
    let socketHandler: Sinon.SinonStubbedInstance<SocketHandler>;
    let boardHandler: Sinon.SinonStubbedInstance<BoardHandler>;
    let statsHandler: Sinon.SinonStubbedInstance<SessionStatsHandler>;

    let playerInfo: PlayerInfo;
    let runAction: (action: Action) => Action | null;
    let sandboxRandom: SinonSandbox;

    beforeEach(() => {
        reserveHandler = createStubInstance(ReserveHandler);
        dictionaryService = createStubInstance(DictionaryService);
        socketHandler = createStubInstance(SocketHandler);
        boardHandler = createStubInstance(BoardHandler);
        statsHandler = createStubInstance(SessionStatsHandler);

        playerInfo = { id: 'test', name: 'mauricetest', isHuman: false };
        runAction = () => null;

        service = new VirtualPlayerEasy(dictionaryService as unknown as DictionaryService, playerInfo, runAction);

        service.init(
            boardHandler as unknown as BoardHandler,
            reserveHandler,
            socketHandler as unknown as SocketHandler,
            statsHandler as unknown as SessionStatsHandler,
        );

        boardHandler['board'] = new Board(BOARD_SIZE);
        sandboxRandom = createSandbox();
    });

    afterEach(() => {
        sandboxRandom.restore();
    });

    it('should create VirtualPlayerEasy', () => {
        expect(service).to.be.ok;
    });

    it('should return ExchangeAction', () => {
        sandboxRandom.stub(Math, 'random').returns(RANDOM_RETURN_EXCHANGE);
        const returnValue = service['nextAction']();
        expect(returnValue).to.be.instanceof(ExchangeAction);
    });

    it('should return SkipAction', () => {
        sandboxRandom.stub(Math, 'random').returns(RANDOM_RETURN_SKIP);
        const returnValue = service['nextAction']();
        expect(returnValue).to.be.instanceof(SkipAction);
    });

    it('should return PlayActionEasy', () => {
        sandboxRandom.stub(Math, 'random').returns(RANDOM_RETURN_PLAY);
        const returnValue = service['nextAction']();
        expect(returnValue).to.be.instanceof(PlayActionEasy);
    });
});
