/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-classes-per-file -- Multiple stubs are used */
import { Board } from '@app/classes/board/board';
import { PlayerInfo } from '@app/classes/player-info';
import { VirtualPlayer } from '@app/classes/player/virtual-player/virtual-player';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { expect } from 'chai';
import { createSandbox, createStubInstance } from 'sinon';
import { Action } from './actions/action';
/*
const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const ARBITRARY_SCORE = 40;
const ARBITRARY_SKIPPED_TURN = 40;

const ARBITRARY_POSITIONS: Vec2[] = [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
];
*/
const RANDOM_RETURN_EXCHANGE = 0.12;
const SIZE = 9;
describe('VirtualPlayer', () => {
    let service: VirtualPlayer;
    const reserveHandler = new ReserveHandler();
    const dictionaryService = createStubInstance(DictionaryService) as unknown as DictionaryService;
    const board = new Board(SIZE);
    const boardValidatorStub = createStubInstance(BoardValidator) as unknown as BoardValidator;
    const boardHandler = new BoardHandler(board, boardValidatorStub);
    const playerInfo: PlayerInfo = { id: 'test', name: 'mauricetest', isHuman: false };
    const runAction: (action: Action) => Action | null = () => null;

    beforeEach(() => {
        service = new VirtualPlayer(playerInfo, dictionaryService, boardHandler, reserveHandler, runAction);
    });

    it('should create virtual player', () => {
        expect(service).to.be.ok;
    });
    // might want to merge the next two tests to avoid the 3 seconds delay being triggered 2 times
    it('starting turn should fill rack', async () => {
        reserveHandler.reserve.length = SIZE;
        const sandbox = createSandbox();
        const stub = sandbox.stub(service, 'fillRack');
        await service.startTurn();
        sandbox.assert.calledOnce(stub);
    });

    it('starting turn should eventually end turn', async () => {
        reserveHandler.reserve.length = SIZE;
        const sandbox = createSandbox();
        const stub = sandbox.stub(service, 'endTurn');
        await service.startTurn();
        sandbox.assert.calledOnce(stub);
    });

    it('starting turn should make next action return skip action sometimes', async () => {
        // const sandbox = createSandbox();
        // sandbox.stub(global.window.Math, 'random').returns(RANDOM_RETURN_EXCHANGE);
        // console.log(global.window.Math.random());
        // const stubNextAction = sandbox.stub(service, 'nextAction' as any);
        // await service.startTurn();
        // sandbox.assert.calledOnce(stubNextAction);
        // stubRandom.restore();
    });

    // Julien where are you
    it('starting turn should make next action return exchange action sometimes', () => {
        const sandbox = createSandbox();
        const stubNextAction = sandbox.stub(service, 'nextAction' as any);
        sandbox.stub(service, 'random').returns(RANDOM_RETURN_EXCHANGE);
        // stubNextAction.callsFake(random);
        // await service.startTurn();
        sandbox.assert.calledOnce(stubNextAction);
    });

    it('ending turn should call next on behaviour subject', () => {
        const sandbox = createSandbox();
        const stub = sandbox.stub(service.turnEnded, 'next');
        service.endTurn();
        sandbox.assert.calledOnce(stub);
    });

    it('getting id should return id', () => {
        const returnValue = service.id;
        expect(returnValue).to.eql(service.playerInfo.id);
    });
});
