/* eslint-disable dot-notation,@typescript-eslint/no-unused-expressions,no-unused-expressions,@typescript-eslint/no-empty-function */
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { expect } from 'chai';
import { Observable } from 'rxjs';
import { createStubInstance } from 'sinon';
import { Player } from './player';
import { SessionStatsHandler } from '@app/handlers/stats-handlers/session-stats-handler/session-stats-handler';
import { PlayerStatsHandler } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-handler';

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

class PlayerTester extends Player {
    constructor() {
        super({ id: '', name: '', isHuman: false });
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
    const statsHandler = createStubInstance(SessionStatsHandler);
    const playerStatsHandler = createStubInstance(PlayerStatsHandler);

    statsHandler.getPlayerStatsHandler.returns(playerStatsHandler as unknown as PlayerStatsHandler);

    reserveHandler.drawLetter.returns('a');
    reserveHandler['reserve'] = LETTERS;
    const socketHandler = createStubInstance(SocketHandler);

    beforeEach(() => {
        reserveHandler['reserve'] = [];
        service.rack = [];
        service.init(
            boardHandler as unknown as BoardHandler,
            reserveHandler as unknown as ReserveHandler,
            socketHandler as unknown as SocketHandler,
            statsHandler as unknown as SessionStatsHandler,
        );
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
        expect(service.rack.length).to.not.eql(0);
    });

    it('should not fill rack if reserve.length <= 0', () => {
        service.fillRack();
        expect(service.rack.length).to.eql(0);
    });

    it('should not fill rack if rack has 7 letters', () => {
        service.rack = LETTERS;
        service.fillRack();
        expect(service.rack).to.eql(LETTERS);
    });

    it('onTurn should return turnEnded as observable', () => {
        const returnValue = service.onTurn();
        expect(typeof returnValue).to.eql(typeof new Observable<string>());
    });
});
