/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { expect } from 'chai';
import Sinon, { createStubInstance } from 'sinon';
import { ExchangeAction } from './exchange-action';
import { PlayerStatsHandler } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-handler';

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

describe('Exchange Action', () => {
    let reserveHandler: Sinon.SinonStubbedInstance<ReserveHandler>;
    let socketHandler: Sinon.SinonStubbedInstance<SocketHandler>;
    let statsHandler: Sinon.SinonStubbedInstance<PlayerStatsHandler>;
    let rack: string[];
    let action: ExchangeAction;

    beforeEach(() => {
        reserveHandler = createStubInstance(ReserveHandler);
        socketHandler = createStubInstance(SocketHandler);
        statsHandler = createStubInstance(PlayerStatsHandler);

        reserveHandler.reserve = ['a', 'b', 'c'];
        rack = [];

        action = new ExchangeAction(reserveHandler, socketHandler as unknown as SocketHandler, statsHandler, rack, true);

        LETTERS.forEach((l) => rack.push(l));
    });

    it('should create action', () => {
        expect(action).to.be.ok;
    });

    it('execute should change letters', () => {
        action = new ExchangeAction(reserveHandler, socketHandler as unknown as SocketHandler, statsHandler, rack, true);
        action.execute();
        expect(rack).to.not.eql(LETTERS);
    });
});
