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
import { SocketService } from '@app/services/socket/socket-service';
import { Message, Placement, ValidationResponse } from '@common';
import { expect } from 'chai';
import { createSandbox, createStubInstance, stub } from 'sinon';
import http from 'http';
import { Action } from './actions/action';
import { Board } from '@app/classes/board/board';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { Observable } from 'rxjs';
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
export class SocketHandlerMock extends SocketHandler {
    sendData<T>(event: string, data: T): void {
        // Does nothing
    }

    sendMessage(message: Message): void {
        // Does nothing
    }
}

export class SocketServiceMock extends SocketService {
    init(server: http.Server): void {
        // Does nothing
    }

    send<T>(event: string, roomId: string, message?: T) {
        // Does nothing
    }
}

export class BoardHandlerMock extends BoardHandler {
    lookupLetters(letters: Placement[]): ValidationResponse {
        return { isSuccess: false, points: 0, description: '' };
    }

    placeLetters(letters: Placement[]): ValidationResponse {
        return { isSuccess: false, points: 0, description: '' };
    }

    retrieveNewLetters(placements: Placement[]): Placement[] {
        return [];
    }
}
const RANDOM_RETURN_EXCHANGE = 0.12;
const SIZE = 9;
describe('VirtualPlayer', () => {
    let service: VirtualPlayer;
    const reserveHandler = new ReserveHandler();
    const dictionaryService = new DictionaryService();
    const board = new Board(SIZE);
    const boardValidator = createStubInstance(BoardValidator) as unknown as BoardValidator;
    const boardHandler = new BoardHandlerMock(board, boardValidator);
    const socketServiceMock = new SocketServiceMock();
    const socketHandlerMock = new SocketHandlerMock(socketServiceMock);
    const playerInfo: PlayerInfo = { id: 'test', name: 'mauricetest', isHuman: false };
    const runAction: (action: Action) => Action | null = () => null;

    beforeEach(() => {
        service = new VirtualPlayer(playerInfo, dictionaryService, runAction);
        service.init(boardHandler, reserveHandler, socketHandlerMock);
    });

    it('should create virtual player', () => {
        expect(service).to.be.ok;
    });
    // might want to merge the next two tests to avoid the 3 seconds delay being triggered 2 times
    it('starting turn should fill rack', async () => {
        reserveHandler.reserve.length = SIZE;
        const sandbox = createSandbox();
        const stubFill = sandbox.stub(service, 'fillRack');
        await service.startTurn();
        sandbox.assert.calledOnce(stubFill);
    });

    it('starting turn should eventually end turn', async () => {
        reserveHandler.reserve.length = SIZE;
        await service.startTurn();
        expect(service.isTurn).to.be.false;
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
    it('starting turn should make next action return exchange action sometimes', async () => {
        const sandbox = createSandbox();
        const stubNextAction = sandbox.stub(service, 'nextAction' as any);
        stub(Math, 'random').returns(RANDOM_RETURN_EXCHANGE);
        // stubNextAction.callsFake(random);
        await service.startTurn();
        sandbox.assert.calledOnce(stubNextAction);
    });
    /*
    it('ending turn should call next on behaviour subject', () => {
        const sandbox = createSandbox();
        const stubNext = sandbox.stub(service.turnEnded, 'next');
        service.endTurn();
        sandbox.assert.calledOnce(stubNext);
    });
    */
    it('getting id should return id', () => {
        const returnValue = service.id;
        expect(returnValue).to.eql(service.playerInfo.id);
    });

    it('onTurn should return turnEnded as observable', () => {
        const returnValue = service.onTurn();
        expect(typeof returnValue).to.eql(typeof new Observable<string>());
    });
});
