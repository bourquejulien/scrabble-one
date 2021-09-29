/* eslint-disable max-classes-per-file -- Need to implements many stubs */
import { Dictionary } from '@app/classes/dictionary/dictionary';
import { Validation } from '@app/classes/validation/validation';
import { Board, ImmutableBoard } from '@app/classes/board/board';
import { Direction } from '@app/classes//board/direction';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Vec2 } from '@app/classes/vec2';
import { PlayGenerator } from './play-generator';
import { Constants } from '@app/constants/global.constants';

class StubDictionary implements Dictionary {
    words: string[] = [];

    lookUpStart(lookupWord: string): { isWord: boolean; isOther: boolean } {
        let isWord = false;
        let isOther = false;
        for (const word of this.words) {
            if (lookupWord > word) {
                continue;
            }

            if (lookupWord === word) {
                isWord = true;
            }

            if (word.substring(0, lookupWord.length) === lookupWord) {
                isOther = true;
            }
        }

        return { isWord, isOther };
    }

    lookUpEnd(lookupWord: string): boolean {
        let isOther = false;

        for (const word of this.words) {
            if (lookupWord > word) {
                continue;
            }

            if (word.substring(word.length - lookupWord.length, word.length) === lookupWord) {
                isOther = true;
            }
        }

        return isOther;
    }

    lookup(word: string): boolean {
        return this.words.find((w) => w === word) !== undefined;
    }
}

class MockValidation implements Validation {
    isValid = true;
    board = new Board(Constants.GRID.GRID_SIZE);
    foundWords: { word: string; initialPosition: Vec2; direction: Direction }[] = [];

    // eslint-disable-next-line no-unused-vars -- Parameters are not needed here as we already got the in retrieveNewLetters.
    lookupLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse {
        return { isSuccess: this.isValid, points: 0, description: '' };
    }

    retrieveNewLetters(word: string, initialPosition: Vec2, direction: Direction): { letter: string; position: Vec2 }[] {
        this.foundWords.push({ word, initialPosition, direction });
        return [];
    }

    get gameBoard(): ImmutableBoard {
        return this.board;
    }
}

describe('PlayGenerator', () => {
    let mockValidation: MockValidation;
    let stubDictionary: StubDictionary;

    beforeEach(() => {
        mockValidation = new MockValidation();
        stubDictionary = new StubDictionary();
    });

    it('should be created', () => {
        expect(new PlayGenerator(stubDictionary, mockValidation, [])).toBeTruthy();
    });

    it('should generate word on empty board', () => {
        const WORD = 'angular';
        stubDictionary.words.push(WORD);

        const playGenerator = new PlayGenerator(stubDictionary, mockValidation, WORD.split(''));
        playGenerator.generateNext();

        expect(mockValidation.foundWords[0].word).toEqual(WORD);
    });
});
