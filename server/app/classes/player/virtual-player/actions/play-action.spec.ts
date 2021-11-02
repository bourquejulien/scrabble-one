/* eslint-disable dot-notation */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board } from '@app/classes/board/board';
import { PlayerData } from '@app/classes/player-data';
import { BoardValidator } from '@app/classes/validation/board-validator';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { Placement, ValidationResponse } from '@common';
import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import { PlayAction } from './play-action';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { Play } from '@app/classes/virtual-player/play';

const VALID_PLACEMENT: Placement[] = [
    { letter: 'B', position: { x: 0, y: 0 } },
    { letter: 'a', position: { x: 0, y: 1 } },
    { letter: 'c', position: { x: 0, y: 2 } },
];
const SIZE = 9;
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
    const board = new Board(SIZE);
    const boardValidator = createStubInstance(BoardValidator) as unknown as BoardValidator;
    const boardHandler = new BoardHandlerMock(board, boardValidator);
    const dictionary = new DictionaryService();
    const playGenerator: PlayGenerator = new PlayGeneratorMockA(dictionary, boardHandler, LETTERS);
    const playerData: PlayerData = { baseScore: 0, scoreAdjustment: 0, skippedTurns: 0, rack: [] };
    let action = new PlayAction(boardHandler, playGenerator, playerData);
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
    /*
    it('should not generate plays', () => {
        const playGeneratorMock = new PlayGeneratorMockB(dictionary, boardHandler, LETTERS);
        action = new PlayAction(boardHandler, playGeneratorMock, playerData);
        action['playGenerator']['plays'][0].score = Math.floor(Math.random() * action['() - min + 1) + min)
        const returnValue = action.execute();
        expect(returnValue).to.be.null;
    });
    */
});
