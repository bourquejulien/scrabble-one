/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { PlayerData } from '@app/classes/player-data';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import { ExchangeAction } from './exchange-action';

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
/* eslint-disable dot-notation */
describe('Exchange Action', () => {
    const reserve: ReserveHandler = new ReserveHandler();
    const socketHandler = createStubInstance(SocketHandler) as unknown as SocketHandler;
    const playerData: PlayerData = { baseScore: 0, scoreAdjustment: 0, skippedTurns: 0, rack: [] };
    let action = new ExchangeAction(reserve, socketHandler, playerData, true);
    beforeEach(() => {
        LETTERS.forEach((l) => playerData.rack.push(l));
    });

    it('should create action', () => {
        expect(action).to.be.ok;
    });

    it('execute should change letters', () => {
        action = new ExchangeAction(reserve, socketHandler, playerData, true);
        action.execute();
        expect(playerData.rack).to.not.eql(LETTERS);
    });
});
