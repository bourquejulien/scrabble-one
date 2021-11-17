/* eslint-disable dot-notation,@typescript-eslint/no-unused-expressions,no-unused-expressions */
import { PlayerInfo } from '@app/classes/player-info';
import { VirtualPlayerEasy } from '@app/classes/player/virtual-player/virtual-player-easy/virtual-player-easy';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { expect } from 'chai';
import { createSandbox, createStubInstance, SinonSandbox } from 'sinon';
import { Board } from '@app/classes/board/board';
import { SkipAction } from '@app/classes/player/virtual-player/actions/skip-action';
import { ExchangeAction } from '@app/classes/player/virtual-player/actions/exchange-action';
import { PlayActionEasy } from '@app/classes/player/virtual-player/virtual-player-easy/actions/play-action-easy';
import { Action } from '@app/classes/player/virtual-player/actions/action';
import { DictionaryHandler } from '@app/handlers/dictionary/dictionary-handler';

const RANDOM_RETURN_EXCHANGE = 0.09;
const RANDOM_RETURN_SKIP = 0.11;
const RANDOM_RETURN_PLAY = 0.21;

const BOARD_SIZE = 15;

describe('VirtualPlayer', () => {
    let service: VirtualPlayerEasy;

    const reserveHandler = createStubInstance(ReserveHandler);
    const dictionaryHandler = createStubInstance(DictionaryHandler);
    const socketHandler = createStubInstance(SocketHandler);
    const boardHandler = createStubInstance(BoardHandler);

    const playerInfo: PlayerInfo = { id: 'test', name: 'mauricetest', isHuman: false };
    const runAction: (action: Action) => Action | null = () => null;
    let sandboxRandom: SinonSandbox;

    beforeEach(() => {
        service = new VirtualPlayerEasy(dictionaryHandler as unknown as DictionaryHandler, playerInfo, runAction);

        service.init(boardHandler as unknown as BoardHandler, reserveHandler, socketHandler as unknown as SocketHandler);
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
