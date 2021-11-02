/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-classes-per-file -- Multiple stubs are used */
import { PlayerInfo } from '@app/classes/player-info';
import { HumanPlayer } from './human-player';
import { expect } from 'chai';
import { createSandbox, createStubInstance } from 'sinon';
import { Message, Placement, ValidationResponse } from '@common';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { SocketService } from '@app/services/socket/socket-service';
import http from 'http';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { Board } from '@app/classes/board/board';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { Observable } from 'rxjs';
const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const RACK = ['a', '*', 'c', 'd', 'e', 'f', 'g'];
const NOT_FILLED_RACK = ['a', 'b', 'c', 'd', 'e'];
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
// const ARBITRARY_SCORE = 40;
// const ARBITRARY_SKIPPED_TURN = 40;
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

    send<T>(event: string, message: T, roomId: string) {
        // Does nothing
    }
}
export class BoardHandlerMock extends BoardHandler {
    lookupLetters(letters: Placement[]): ValidationResponse {
        return { isSuccess: true, points: 0, description: '' };
    }

    placeLetters(letters: Placement[]): ValidationResponse {
        return { isSuccess: false, points: 0, description: '' };
    }

    retrieveNewLetters(placements: Placement[]): Placement[] {
        return placements;
    }
}
const SIZE = 9;
describe('HumanPlayer', () => {
    const board = new Board(SIZE);
    const boardValidator = createStubInstance(BoardValidator) as unknown as BoardValidator;
    const boardHandler = new BoardHandlerMock(board, boardValidator);
    const reserveHandler = new ReserveHandler();
    const socketServiceMock = new SocketServiceMock();
    const socketHandlerMock = new SocketHandlerMock(socketServiceMock);

    let service: HumanPlayer;
    const playerInfo: PlayerInfo = { id: 'testhuman', name: 'humantest', isHuman: true };

    beforeEach(() => {
        service = new HumanPlayer(playerInfo);
        service.isTurn = true;
        service.init(boardHandler, reserveHandler, socketHandlerMock);
    });
    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('skipping turn should increment skip turn', () => {
        const returnValue = service.skipTurn();
        expect(service.playerData.skippedTurns).to.greaterThan(0);
        expect(returnValue).to.eql({ isSuccess: true, body: '' });
    });
    it('exchange letters should return not your turn if is turn is false', () => {
        service.isTurn = false;
        const returnValue = service.exchangeLetters(LETTERS);
        expect(returnValue).to.eql({ isSuccess: false, body: 'Not your turn' });
    });
    it('exchangeLetters should return letters not in rack if the rack is not full', () => {
        const returnValue = service.exchangeLetters(LETTERS);
        expect(returnValue).to.eql({ isSuccess: false, body: 'Letters not in rack' });
    });

    it('exchangeLetters should return letters not in rack if the letters are not all in rack', () => {
        service.playerData.rack = ['a', 'b', 'c', 'd', 'e', 'f', 'z'];
        const returnValue = service.exchangeLetters(LETTERS);
        expect(returnValue).to.eql({ isSuccess: false, body: 'Letters not in rack' });
    });

    it('exchangeletters should exchange letters', () => {
        service.playerData.rack = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        service.exchangeLetters(LETTERS);
        expect(service.playerData.rack).to.not.eql(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    });

    it('exchanging letter should endTurn', () => {
        service.playerData.rack = LETTERS;
        const sandbox = createSandbox();
        const stub = sandbox.stub(service, 'endTurn' as any);
        service.exchangeLetters(LETTERS);
        sandbox.assert.calledOnce(stub);
    });

    it('placing letters should return letters not in rack if the letters are not all in rack', async () => {
        service.playerData.rack = ['z', 'e', 's', 'd', 'e', 'f', 'z'];
        const returnValue = await service.placeLetters(PLACEMENT);
        expect(returnValue).to.eql({ isSuccess: false, body: 'Letters not in rack' });
    });

    it('starting turn should call send data of socketHandler', () => {
        service.isTurn = false;
        const sandbox = createSandbox();
        const stub = sandbox.stub(socketHandlerMock, 'sendData');
        service.startTurn();
        sandbox.assert.calledOnce(stub);
    });

    it('fill rack should fill rack', () => {
        NOT_FILLED_RACK.forEach((l) => service.playerData.rack.push(l));
        service.fillRack();
        expect(service.playerData.rack.length).to.be.greaterThan(NOT_FILLED_RACK.length);
    });

    it('place letters should return not your turn if is turn is false', async () => {
        service.isTurn = false;
        const returnValue = await service.placeLetters(PLACEMENT);
        expect(returnValue).to.eql({ isSuccess: false, body: 'Not your turn' });
    });

    it('place letters should support capital letters as any letter', async () => {
        RACK.forEach((l) => service.playerData.rack.push(l));
        const returnValue = await service.placeLetters(VALID_PLACEMENT);
        expect(returnValue).to.eql({ isSuccess: true, body: '' });
    });

    it('exchangeletters should fail if theres no more letters in reserve', () => {
        reserveHandler.reserve = [];
        const returnValue = service.exchangeLetters(LETTERS);
        expect(returnValue).to.eql({ isSuccess: false, body: 'Letters not in rack' })
    });

    it('onTurn should return turnEnded as observable', () => {
        const returnValue = service.onTurn();
        expect(typeof returnValue).to.eql(typeof new Observable<string>());
    });
});
