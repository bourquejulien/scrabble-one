/* eslint-disable dot-notation,@typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-classes-per-file -- Multiple stubs are used */
import { PlayerInfo } from '@app/classes/player-info';
import { HumanPlayer } from './human-player';
import { expect } from 'chai';
import Sinon, { createSandbox, createStubInstance } from 'sinon';
import { Message, Placement } from '@common';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { SocketService } from '@app/services/socket/socket-service';
import http from 'http';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { Board } from '@app/classes/board/board';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { Observable } from 'rxjs';
import { ValidationFailed, ValidationResponse } from '@app/classes/validation/validation-response';
import { SessionStatsHandler } from '@app/handlers/stats-handlers/session-stats-handler/session-stats-handler';
import { PlayerStatsHandler } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-handler';
import { DictionaryHandler } from '@app/handlers/dictionary-handler/dictionary-handler';

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const RACK = ['a', '*', 'c', 'd', 'e', 'f', 'g'];
const NOT_FILLED_RACK = ['a', 'b', 'c', 'd', 'e'];
const SIZE = 9;
const PLACEMENT: Placement[] = [
    { letter: 'a', position: { x: 0, y: 0 } },
    { letter: 'b', position: { x: 0, y: 1 } },
    { letter: 'c', position: { x: 0, y: 2 } },
];
const VALID_PLACEMENT: Placement[] = [
    { letter: 'B', position: { x: 0, y: 0 } },
    { letter: 'a', position: { x: 0, y: 1 } },
    { letter: 'c', position: { x: 0, y: 2 } },
];

export class SocketHandlerMock extends SocketHandler {
    sendData<T>(event: string, data?: T): void {}

    sendMessage(message: Message): void {}
}

export class SocketServiceMock extends SocketService {
    init(server: http.Server): void {}

    send<T>(event: string, roomId: string, message?: T) {}
}

export class BoardHandlerMock extends BoardHandler {
    lookupLetters(letters: Placement[]): ValidationResponse {
        if (letters === VALID_PLACEMENT) return { isSuccess: true, score: 0, placements: [], words: [] };
        return { isSuccess: false, description: '' };
    }

    placeLetters(letters: Placement[]): ValidationFailed {
        return { isSuccess: false, description: '' };
    }

    retrieveNewLetters(placements: Placement[]): Placement[] {
        return placements;
    }
}

describe('HumanPlayer', () => {
    let playerInfo: PlayerInfo;
    let service: HumanPlayer;
    let board: Board;
    let boardValidator: BoardValidator;
    let statsHandlerStub: Sinon.SinonStubbedInstance<SessionStatsHandler>;
    let playerStatsHandlerStub: Sinon.SinonStubbedInstance<PlayerStatsHandler>;
    let dictionaryHandler: Sinon.SinonStubbedInstance<DictionaryHandler>;
    let boardHandler: BoardHandlerMock;
    let reserveHandler: ReserveHandler;
    let socketServiceMock: SocketServiceMock;
    let socketHandlerMock: SocketHandlerMock;

    beforeEach(() => {
        playerInfo = { id: 'testhuman', name: 'humantest', isHuman: true };

        service = new HumanPlayer(playerInfo);
        board = new Board(SIZE);
        boardValidator = createStubInstance(BoardValidator) as unknown as BoardValidator;
        statsHandlerStub = createStubInstance(SessionStatsHandler);
        playerStatsHandlerStub = createStubInstance(PlayerStatsHandler);
        dictionaryHandler = createStubInstance(DictionaryHandler);
        boardHandler = new BoardHandlerMock(board, boardValidator, false, dictionaryHandler as unknown as DictionaryHandler);
        reserveHandler = new ReserveHandler();
        socketServiceMock = new SocketServiceMock();
        socketHandlerMock = new SocketHandlerMock(socketServiceMock, '0');

        statsHandlerStub.getPlayerStatsHandler.returns(playerStatsHandlerStub as unknown as PlayerStatsHandler);

        service.isTurn = true;
        service.init(boardHandler, reserveHandler, socketHandlerMock, statsHandlerStub as unknown as SessionStatsHandler);
    });

    afterEach(() => {
        reserveHandler = new ReserveHandler();
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('exchange letters should return not your turn if is turn is false', () => {
        service.isTurn = false;
        const returnValue = service.exchangeLetters(LETTERS);
        expect(returnValue).to.be.false;
    });

    it('exchangeLetters should return letters not in rack if the rack is not full', () => {
        const returnValue = service.exchangeLetters(LETTERS);
        expect(returnValue).to.be.false;
    });

    it('exchangeLetters should fail if reserve is smaller than rack_size', () => {
        service.rack = ['a', 'b', 'c', 'd', 'e', 'f', 'z'];
        service['reserveHandler'].reserve = ['a'];
        const returnValue = service.exchangeLetters(['a']);
        expect(returnValue).to.be.false;
    });

    it('exchangeLetters should return letters not in rack if the letters are not all in rack', () => {
        service.rack = ['a', 'b', 'c', 'd', 'e', 'f', 'z'];
        const returnValue = service.exchangeLetters(LETTERS);
        expect(returnValue).to.be.false;
    });

    it('exchangeletters should exchange letters', () => {
        service.rack = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        service.exchangeLetters(LETTERS);
        expect(service.rack).to.not.eql(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    });

    it('exchanging letter should endTurn', () => {
        service.rack = LETTERS;
        const sandbox = createSandbox();
        const stub = sandbox.stub(service, 'endTurn' as any);
        service.exchangeLetters(LETTERS);
        sandbox.assert.calledOnce(stub);
    });

    it('placing letters should return letters not in rack if the letters are not all in rack', async () => {
        service.rack = ['z', 'e', 's', 'd', 'e', 'f', 'z'];
        const returnValue = await service.placeLetters(PLACEMENT);
        expect(returnValue).to.be.false;
    });

    it('starting turn should call send data of socketHandler', () => {
        service.isTurn = false;
        const sandbox = createSandbox();
        const stub = sandbox.stub(socketHandlerMock, 'sendData');
        service.startTurn();
        sandbox.assert.calledOnce(stub);
    });

    it('fill rack should fill rack', () => {
        NOT_FILLED_RACK.forEach((l) => service.rack.push(l));
        service.fillRack();
        expect(service.rack.length).to.be.greaterThan(NOT_FILLED_RACK.length);
    });

    it('place letters should return not your turn if is turn is false', async () => {
        service.isTurn = false;
        const returnValue = await service.placeLetters(PLACEMENT);
        expect(returnValue).to.be.false;
    });

    it('place letters should support capital letters as any letter', async () => {
        RACK.forEach((l) => service.rack.push(l));
        const returnValue = await service.placeLetters(VALID_PLACEMENT);
        expect(returnValue).to.be.true;
    });

    it('exchangeletters should fail if theres no more letters in reserve', () => {
        reserveHandler.reserve = [];
        const returnValue = service.exchangeLetters(LETTERS);
        expect(returnValue).to.be.false;
    });

    it('onTurn should return turnEnded as observable', () => {
        const returnValue = service.onTurn();
        expect(typeof returnValue).to.eql(typeof new Observable<string>());
    });

    it('place letters should fail if validation fails', async () => {
        const RESET_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        RESET_LETTERS.forEach((l) => service.rack.push(l));
        const returnValue = await service.placeLetters(PLACEMENT);
        expect(returnValue).to.be.false;
    });

    it('update rack should go bad if letterindex === -1', () => {
        service['updateRack'](['z']);
        const sandbox = createSandbox();
        const stub = sandbox.stub(service.rack, 'splice');
        sandbox.assert.notCalled(stub);
    });
});
