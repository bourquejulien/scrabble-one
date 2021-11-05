/* eslint-disable dot-notation */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-classes-per-file -- Multiple stubs are used */
import { PlayerInfo } from '@app/classes/player-info';
import { VirtualPlayer } from '@app/classes/player/virtual-player/virtual-player';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { expect } from 'chai';
import { createSandbox, createStubInstance, SinonSandbox, stub } from 'sinon';
import { Action } from './actions/action';
import { Observable } from 'rxjs';
import { Timer } from '@app/classes/delay';
import { LETTER_DEFINITIONS, Vec2 } from '@common';
import { Board } from '@app/classes/board/board';
import { PlayAction } from './actions/play-action';
import { ExchangeAction } from './actions/exchange-action';
import { SkipAction } from './actions/skip-action';
import { PlaceAction } from './actions/place-action';

/*
const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const ARBITRARY_SCORE = 40;
const ARBITRARY_SKIPPED_TURN = 40;
*/

const ARBITRARY_POSITIONS: Vec2[] = [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
];
const RANDOM_RETURN_EXCHANGE = 0.12;
// const RANDOM_PLAY_ACTION = 0.7;
const SIZE = 9;

describe('VirtualPlayer', () => {
    let service: VirtualPlayer;
    const reserveHandler = createStubInstance(ReserveHandler);
    const playAction = createStubInstance(PlayAction);
    const exchangeAction = createStubInstance(ExchangeAction);
    const skipAction = createStubInstance(SkipAction);
    const placeAction = createStubInstance(PlaceAction);
    const dictionaryService = createStubInstance(DictionaryService);
    const socketHandler = createStubInstance(SocketHandler);
    const boardHandler = createStubInstance(BoardHandler);
    reserveHandler['reserve'] = [];
    for (const [letter, letterData] of LETTER_DEFINITIONS) {
        for (let i = 0; i < letterData.maxQuantity; i++) {
            reserveHandler['reserve'].push(letter);
        }
    }
    playAction.execute.returns(playAction as unknown as PlayAction);
    exchangeAction.execute.returns(playAction as unknown as ExchangeAction);
    skipAction.execute.returns(playAction as unknown as SkipAction);
    placeAction.execute.returns(playAction as unknown as PlaceAction);
    const board = createStubInstance(Board);
    const playerInfo: PlayerInfo = { id: 'test', name: 'mauricetest', isHuman: false };
    const runAction: (action: Action) => Action | null = () => null;
    let sandboxRandom: SinonSandbox;
    let sandboxTimer: SinonSandbox;
    let sandboxNext: SinonSandbox;

    beforeEach(() => {
        (board as unknown as Board)['filledPositions'] = ARBITRARY_POSITIONS;
        service = new VirtualPlayer(playerInfo, dictionaryService as unknown as DictionaryService, runAction);
        service.init(boardHandler as unknown as BoardHandler, reserveHandler, socketHandler as unknown as SocketHandler);
        sandboxRandom = createSandbox();
        sandboxTimer = createSandbox();
        sandboxNext = createSandbox();
        stub(board, 'positions').get(() => {
            return ARBITRARY_POSITIONS;
        });
    });
    afterEach(() => {
        sandboxRandom.restore();
        sandboxTimer.restore();
        sandboxNext.restore();
    });

    it('should create virtual player', () => {
        expect(service).to.be.ok;
    });
    it('starting turn should fill rack', async () => {
        const sandbox = createSandbox();
        const stubFill = sandbox.stub(service, 'fillRack');
        sandboxTimer.stub(Timer, 'delay').returns(Promise.resolve());
        sandboxRandom.stub(Math, 'random').returns(RANDOM_RETURN_EXCHANGE);
        await service.startTurn();
        sandbox.assert.calledOnce(stubFill);
    });

    it('starting turn should eventually end turn', async () => {
        reserveHandler.reserve.length = SIZE;
        sandboxTimer.stub(Timer, 'delay').returns(Promise.resolve());
        sandboxRandom.stub(Math, 'random').returns(RANDOM_RETURN_EXCHANGE);
        await service.startTurn();
        expect(service.isTurn).to.be.false;
    });

    it('starting turn should make next action return Exchange action sometimes', () => {
        sandboxRandom.stub(Math, 'random').returns(RANDOM_RETURN_EXCHANGE);
        sandboxTimer.stub(Timer, 'delay').returns(Promise.resolve());
        const returnValue = service['nextAction']();
        expect(returnValue instanceof ExchangeAction).to.be.true;
    });
    /*
    it('starting turn should make next action return play action sometimes', () => {
        sandboxRandom.stub(Math, 'random').returns(RANDOM_PLAY_ACTION);
        sandboxTimer.stub(Timer, 'delay').returns(Promise.resolve());
        const returnValue = service['nextAction']();
        expect(returnValue instanceof PlayAction).to.be.true;
    });
*/
    it('starting turn should make next action return skip action sometimes', () => {
        sandboxRandom.stub(Math, 'random').returns(0);
        sandboxTimer.stub(Timer, 'delay').returns(Promise.resolve());
        const returnValue = service['nextAction']();
        expect(returnValue instanceof SkipAction).to.be.true;
    });

    it('getting id should return id', () => {
        const returnValue = service.id;
        expect(returnValue).to.eql(service.playerInfo.id);
    });

    it('onTurn should return turnEnded as observable', () => {
        const returnValue = service.onTurn();
        expect(typeof returnValue).to.eql(typeof new Observable<string>());
    });
});
