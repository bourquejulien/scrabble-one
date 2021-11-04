/* eslint-disable no-restricted-imports */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { expect } from 'chai';
import { Observable } from 'rxjs';
import { createStubInstance } from 'sinon';
import { Player } from './player';
/*
const PLAYER_INFO_A: PlayerInfo = { id: '0', name: 'tester1', isHuman: true };

const PLAYER_INFO_B: PlayerInfo = { id: '1', name: 'tester2', isHuman: false };
const PLAYER_DATA_DEFAULT: PlayerData = { baseScore: 0, scoreAdjustment: 0, skippedTurns: 4, rack: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] };
const EXPECTED_NB_PLAYERS = 2;
*/
const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
class PlayerTester extends Player {
    constructor() {
        super();
    }
    async startTurn(): Promise<void> {
        // Does Nothing
        return new Promise<void>(() => {});
    }
}
describe('Player', () => {
    const service = new PlayerTester();
    const boardHandler = createStubInstance(BoardHandler);
    const reserveHandler = createStubInstance(ReserveHandler);
    reserveHandler.drawLetter.returns('a');
    reserveHandler['reserve'] = LETTERS;
    const socketHandler = createStubInstance(SocketHandler);
    beforeEach(() => {
        reserveHandler['reserve'] = [];
        service.playerData.rack = [];
        service.init(boardHandler as unknown as BoardHandler, reserveHandler as unknown as ReserveHandler, socketHandler as unknown as SocketHandler);
    });
    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('init should initialize', () => {
        expect(service['boardHandler']).to.not.be.undefined;
        expect(service['reserveHandler']).to.not.be.undefined;
        expect(service['socketHandler']).to.not.be.undefined;
    });
    it('fill rack should fill rack', () => {
        reserveHandler['reserve'] = LETTERS;
        service.fillRack();
        expect(service.playerData.rack.length).to.not.eql(0);
    });
    it('should not fill rack if reserve.length <= 0', () => {
        service.fillRack();
        expect(service.playerData.rack.length).to.eql(0);
    });
    it('should not fill rack if rack has 7 letters', () => {
        service.playerData.rack = LETTERS;
        service.fillRack();
        expect(service.playerData.rack).to.eql(LETTERS);
    });
    it('onTurn should return turnEnded as observable', () => {
        const returnValue = service.onTurn();
        expect(typeof returnValue).to.eql(typeof new Observable<string>());
    });
    it('should count points', () => {
        service.playerData.rack = LETTERS;
        expect(service.rackPoints()).to.be.greaterThan(0);
    });

    it('getting stats should return good stats', () => {
        service.playerData = { baseScore: 0, scoreAdjustment: 0, skippedTurns: 0, rack: LETTERS };
        expect(service.stats).to.eql({ points: 0, rackSize: 7 });
    });
    it('should support letter points not found', () => {
        service.playerData = { baseScore: 0, scoreAdjustment: 0, skippedTurns: 0, rack: ['['] };
        service.rackPoints();
        expect(service.stats).to.eql({ points: 0, rackSize: 1 });
    });
});
