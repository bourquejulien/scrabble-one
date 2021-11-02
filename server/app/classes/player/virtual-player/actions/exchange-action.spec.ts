/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { PlayerData } from '@app/classes/player-data';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { expect } from 'chai';
import { ExchangeAction } from './exchange-action';

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
/* eslint-disable dot-notation */
describe('Exchange Action', () => {
    const reserve: ReserveHandler = new ReserveHandler();
    const playerData: PlayerData = { baseScore: 0, scoreAdjustment: 0, skippedTurns: 0, rack: [] };
    let action = new ExchangeAction(reserve, playerData);
    beforeEach(() => {
        LETTERS.forEach((l) => playerData.rack.push(l));
    });

    it('should create action', () => {
        expect(action).to.be.ok;
    });

    it('execute should change letters', () => {
        action = new ExchangeAction(reserve, playerData);
        action.execute();
        expect(playerData.rack).to.not.eql(LETTERS);
    });
});
