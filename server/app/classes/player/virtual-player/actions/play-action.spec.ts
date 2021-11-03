/* eslint-disable dot-notation */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { PlayerData } from '@app/classes/player-data';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { Placement, ValidationResponse } from '@common';
import { expect } from 'chai';
import { createStubInstance, stub } from 'sinon';
import { PlayAction } from './play-action';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { Play } from '@app/classes/virtual-player/play';

const VALID_PLACEMENT: Placement[] = [
    { letter: 'B', position: { x: 0, y: 0 } },
    { letter: 'a', position: { x: 0, y: 1 } },
    { letter: 'c', position: { x: 0, y: 2 } },
];
const PLAY: Play[] = [{ score: 8, word: 'bac', letters: VALID_PLACEMENT }];

export class BoardHandlerMock extends BoardHandler {
    lookupLetters(letters: Placement[]): ValidationResponse {
        if (letters === VALID_PLACEMENT) return { isSuccess: true, points: 0, description: '' };
        return { isSuccess: false, points: 0, description: '' };
    }

    placeLetters(letters: Placement[]): ValidationResponse {
        return { isSuccess: false, points: 0, description: '' };
    }

    retrieveNewLetters(placements: Placement[]): Placement[] {
        return placements;
    }
}

export class PlayGeneratorMockA extends PlayGenerator {
    get orderedPlays(): Play[] {
        return PLAY;
    }
    generateNext(): boolean {
        return false;
    }
}

export class PlayGeneratorMockB extends PlayGenerator {
    get orderedPlays(): Play[] {
        return [];
    }
    generateNext(): boolean {
        return false;
    }
}
const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
/* eslint-disable dot-notation */
describe('Play Action', () => {
    // const board = new Board(SIZE);
    // const boardValidator = createStubInstance(BoardValidator) as unknown as BoardValidator;
    const boardHandler = createStubInstance(BoardHandler);
    boardHandler.lookupLetters.returns({ isSuccess: true, points: 0, description: '' });
    boardHandler.placeLetters.returns({ isSuccess: false, points: 0, description: '' });
    boardHandler.retrieveNewLetters.returns(VALID_PLACEMENT);
    const playGeneratorA = createStubInstance(PlayGenerator);
    playGeneratorA.generateNext.returns(false);
    stub(playGeneratorA, 'orderedPlays').get(() => {
        return PLAY;
    });
    const playerData: PlayerData = { baseScore: 0, scoreAdjustment: 0, skippedTurns: 0, rack: [] };
    let action = new PlayAction(boardHandler as unknown as BoardHandler, playGeneratorA as unknown as PlayGenerator, playerData);
    beforeEach(() => {
        LETTERS.forEach((l) => playerData.rack.push(l));
    });

    it('should create action', () => {
        expect(action).to.be.ok;
    });

    it('should generate play', () => {
        const returnValue = action.execute();
        expect(returnValue).to.be.not.null;
    });

    // This test will work when ill be able to stub random
    it('should not generate plays', () => {
        const playGeneratorMock = createStubInstance(PlayGenerator);
        playGeneratorMock.generateNext.returns(false);
        stub(playGeneratorMock, 'orderedPlays').get(() => {
            return [];
        });
        action = new PlayAction(boardHandler as unknown as BoardHandler, playGeneratorMock as unknown as PlayGenerator, playerData);

        const returnValue = action.execute();
        expect(returnValue).to.be.null;
    });
});
