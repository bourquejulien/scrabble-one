/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { Placement } from '@common';
import { expect } from 'chai';
import Sinon, { createSandbox, createStubInstance } from 'sinon';
import { PlaceAction } from './place-action';
import { Play } from '@app/classes/virtual-player/play';
import { Action } from '@app/classes/player/virtual-player/actions/action';
import { PlayerStatsHandler } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-handler';

const VALID_PLACEMENT: Placement[] = [
    { letter: 'B', position: { x: 0, y: 0 } },
    { letter: 'a', position: { x: 0, y: 1 } },
    { letter: 'c', position: { x: 0, y: 2 } },
];

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
describe('Place Action', () => {
    let boardHandler: Sinon.SinonStubbedInstance<BoardHandler>;
    let statsHandler: Sinon.SinonStubbedInstance<PlayerStatsHandler>;
    let play: Play;
    let rack: string[];
    let action: Action;

    beforeEach(() => {
        boardHandler = createStubInstance(BoardHandler);
        statsHandler = createStubInstance(PlayerStatsHandler);
        play = {
            isSuccess: true,
            score: 12,
            placements: [
                { letter: 'l', position: { x: 0, y: 0 } },
                { letter: 'l', position: { x: 0, y: 0 } },
                { letter: 'l', position: { x: 0, y: 0 } },
            ],
            words: [],
        };
        rack = [];
        action = new PlaceAction(boardHandler as unknown as BoardHandler, statsHandler, rack, play);

        boardHandler.lookupLetters.returns({ isSuccess: true, score: 0, placements: [], words: [] });
        boardHandler.placeLetters.returns({ isSuccess: false, description: '' });
        boardHandler.retrieveNewLetters.returns(VALID_PLACEMENT);
        LETTERS.forEach((l) => rack.push(l));
    });

    it('should create action', () => {
        expect(action).to.be.ok;
    });

    it('should place letters', () => {
        const sandbox = createSandbox();
        const stubSplice = sandbox.stub(action['rack'], 'splice');
        const returnValue = action.execute();
        sandbox.assert.calledThrice(stubSplice);
        expect(returnValue).to.be.null;
    });
});
