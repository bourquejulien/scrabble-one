/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
// import { Board } from '@app/classes/board/board';
import { PlayerData } from '@app/classes/player-data';
// import { BoardValidator } from '@app/classes/validation/board-validator';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { Placement } from '@common';
import { expect } from 'chai';
import { createSandbox, createStubInstance } from 'sinon';
import { PlaceAction } from './place-action';
import { Play } from '@app/classes/virtual-player/play';

const VALID_PLACEMENT: Placement[] = [
    { letter: 'B', position: { x: 0, y: 0 } },
    { letter: 'a', position: { x: 0, y: 1 } },
    { letter: 'c', position: { x: 0, y: 2 } },
];

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
/* eslint-disable dot-notation */
describe('Place Action', () => {
    const boardHandler = createStubInstance(BoardHandler);
    boardHandler.lookupLetters.returns({ isSuccess: true, score: 0, placements: [], words: [] });
    boardHandler.placeLetters.returns({ isSuccess: false, description: '' });
    boardHandler.retrieveNewLetters.returns(VALID_PLACEMENT);
    const play: Play = { score: 0, word: 'bac', letters: VALID_PLACEMENT };
    const playerData: PlayerData = { baseScore: 0, scoreAdjustment: 0, skippedTurns: 0, rack: [] };
    const action = new PlaceAction(boardHandler as unknown as BoardHandler, play, playerData);
    beforeEach(() => {
        LETTERS.forEach((l) => playerData.rack.push(l));
    });

    it('should create action', () => {
        expect(action).to.be.ok;
    });

    it('should place letters', () => {
        const sandbox = createSandbox();
        const stubSplice = sandbox.stub(action['playerData'].rack, 'splice');
        const returnValue = action.execute();
        sandbox.assert.calledThrice(stubSplice);
        expect(returnValue).to.be.null;
    });
});
