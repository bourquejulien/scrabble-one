/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable max-classes-per-file -- Multiple stubs are used */
import { PlayerInfo } from '@app/classes/player-info';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { HumanPlayer } from './human-player';
import { expect } from 'chai';
import { createSandbox, createStubInstance } from 'sinon';
import { Placement } from '@common';
const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const PLACEMENT_FAILED: Placement[] = [
    { letter: 'a', position: { x: 0, y: 0 } },
    { letter: 'b', position: { x: 0, y: 1 } },
    { letter: 'c', position: { x: 0, y: 2 } },
];
// const ARBITRARY_SCORE = 40;
// const ARBITRARY_SKIPPED_TURN = 40;

describe('HumanPlayer', () => {
    let service: HumanPlayer;
    const reserve = new ReserveHandler();
    const board = createStubInstance(BoardHandler) as unknown as BoardHandler;
    const playerInfo: PlayerInfo = { id: 'testhuman', name: 'humantest', isHuman: true };

    beforeEach(() => {
        service = new HumanPlayer(playerInfo, board, reserve);
    });
    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('skipping turn should increment skip turn', () => {
        const returnValue = service.skipTurn();
        expect(service.playerData.skippedTurns).to.greaterThan(0);
        expect(returnValue).to.eql({ isSuccess: true, body: '' });
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
        const stub = sandbox.stub(service, 'endTurn');
        service.exchangeLetters(LETTERS);
        sandbox.assert.calledOnce(stub);
    });

    it('placing letters should return letters not in rack if the letters are not all in rack', async () => {
        service.playerData.rack = ['z', 'e', 's', 'd', 'e', 'f', 'z'];
        const returnValue = await service.placeLetters(PLACEMENT_FAILED);
        expect(returnValue).to.eql({ isSuccess: false, body: 'Letters not in rack' });
    });
});
