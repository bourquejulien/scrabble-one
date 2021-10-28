/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { PlayerData } from '@app/classes/player-data';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { expect } from 'chai';
import { ExchangeAction } from './exchange-action';

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
/* eslint-disable dot-notation */
describe('Exchange Action', () => {
    let service: ExchangeAction;
    const reserve: ReserveHandler = new ReserveHandler();
    const playerData: PlayerData = { score: 0, skippedTurns: 0, rack: [] };
    beforeEach(() => {
        service = new ExchangeAction(reserve, playerData);
    });

    it('should create action', () => {
        expect(service).to.be.ok;
    });

    it('execute should change letters', () => {
        // needs to spy on playerData
        playerData.rack = LETTERS;
        service = new ExchangeAction(reserve, playerData);
        service.execute();
    });
});
