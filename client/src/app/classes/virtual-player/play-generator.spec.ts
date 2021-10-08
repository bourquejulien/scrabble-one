/* eslint-disable max-classes-per-file -- Need to implements many stubs */
import { Direction } from '@app/classes//board/direction';
import { Board, ImmutableBoard } from '@app/classes/board/board';
import { Dictionary } from '@app/classes/dictionary/dictionary';
import { Validation } from '@app/classes/validation/validation';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Vec2 } from '@common/vec2';
import { Constants } from '@app/constants/global.constants';
import { PlayGenerator } from './play-generator';

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

    it('should retrieve existing word', () => {
        const WORD = 'scrabble';
        mockValidation.board.merge([
            { letter: 's', position: { x: 7, y: 7 } },
            { letter: 'c', position: { x: 8, y: 7 } },
            { letter: 'r', position: { x: 9, y: 7 } },
            { letter: 'a', position: { x: 10, y: 7 } },
            { letter: 'b', position: { x: 11, y: 7 } },
            { letter: 'b', position: { x: 12, y: 7 } },
            { letter: 'l', position: { x: 13, y: 7 } },
            { letter: 'e', position: { x: 14, y: 7 } },
        ]);

        const playGenerator = new PlayGenerator(stubDictionary, mockValidation, []);
        // eslint-disable-next-line dot-notation -- Needed for private method testing
        const startPosition = playGenerator['retrieveStartPosition']({ x: 14, y: 7 }, Direction.Right);
        // eslint-disable-next-line dot-notation -- Needed for private method testing
        const retrievedWord = playGenerator['retrieveExistingWord'](startPosition, Direction.Right);

        expect(startPosition).toEqual({ x: 7, y: 7 });
        expect(retrievedWord).toEqual(WORD);
    });

    it('should generate word on non-empty board', () => {
        const GENERATED_WORD = 'lassitude';
        const RACK = ['s', 's', 'i', 't', 'u', 'd', 'e'];
        stubDictionary.words.push(GENERATED_WORD);
        mockValidation.board.merge([
            { letter: 'l', position: { x: 7, y: 7 } },
            { letter: 'a', position: { x: 8, y: 7 } },
        ]);

        const playGenerator = new PlayGenerator(stubDictionary, mockValidation, RACK);
        playGenerator.generateNext();

        expect(mockValidation.foundWords[0].word).toEqual(GENERATED_WORD);
        expect(playGenerator.orderedPlays.length).toEqual(2);
    });

    it('should not generate non validated words', () => {
        const WORD = 'angular';
        stubDictionary.words.push(WORD);

        mockValidation.isValid = false;
        const playGenerator = new PlayGenerator(stubDictionary, mockValidation, WORD.split(''));
        playGenerator.generateNext();

        expect(playGenerator.orderedPlays.length).toEqual(0);
    });
});
