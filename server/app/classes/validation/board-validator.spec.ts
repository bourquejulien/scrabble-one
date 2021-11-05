/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions -- To be */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board } from '@app/classes/board/board';
import { Dictionary } from '@app/classes/dictionary/dictionary';
import { Config } from '@app/config';
import JsonBonuses from '@assets/bonus.json';
import { Bonus, BonusInfos, Direction, LETTER_DEFINITIONS, Placement, Vec2 } from '@common';
import { expect } from 'chai';
import { BoardValidator } from './board-validator';

const WORDS: string[] = ['pomme', 'orange', 'poire', 'raisin', 'peche', 'banane', 'bananes'];
const mockedDictionary: Set<string> = new Set(WORDS);

const generatePlacement = (word: string, initialPosition: Vec2, direction: Direction): Placement[] => {
    const letters: Placement[] = [];

    let xIncr: number;
    let yIncr: number;

    switch (direction) {
        case Direction.Down:
            xIncr = 0;
            yIncr = 1;
            break;

        case Direction.Up:
            xIncr = 0;
            yIncr = -1;
            break;

        case Direction.Right:
            xIncr = 1;
            yIncr = 0;
            break;

        case Direction.Left:
            xIncr = -1;
            yIncr = 0;
            break;

        default:
            xIncr = 0;
            yIncr = 0;
            break;
    }

    for (let i = 0; i < word.length; i++) {
        letters.push({ letter: word[i], position: { x: initialPosition.x + xIncr * i, y: initialPosition.y + yIncr * i } });
    }

    return letters;
};

const generateLetters = (): { [key: string]: number } => {
    const letterValues: { [key: string]: number } = {};

    for (const [letter, data] of LETTER_DEFINITIONS) {
        letterValues[letter] = data.points;
    }

    return letterValues;
};

const retrieveBonuses = (): BonusInfos[] => {
    const bonuses: BonusInfos[] = [];

    for (const jsonBonus of JsonBonuses) {
        const bonusInfo: BonusInfos = { bonus: jsonBonus.Bonus as Bonus, position: jsonBonus.Position };
        bonuses.push(bonusInfo);
    }

    return bonuses;
};

class StubDictionary implements Dictionary {
    lookup(word: string): boolean {
        return mockedDictionary.has(word) ?? false;
    }

    // eslint-disable-next-line no-unused-vars -- Unused method in BoardValidator
    lookUpStart(word: string): { isWord: boolean; isOther: boolean } {
        throw new Error('Method not implemented.');
    }

    // eslint-disable-next-line no-unused-vars -- Unused method in BoardValidator
    lookUpEnd(word: string): boolean {
        throw new Error('Method not implemented.');
    }
}

describe('BoardValidator', () => {
    let board: Board;
    let boardValidator: BoardValidator;
    let stubDictionaryService: StubDictionary;
    let centerPosition: Vec2;

    beforeEach(() => {
        board = new Board(Config.GRID.GRID_SIZE, retrieveBonuses());
        stubDictionaryService = new StubDictionary();
        boardValidator = new BoardValidator(board, stubDictionaryService, generateLetters());
        const halfBoardSize = Math.floor(board.size / 2);
        centerPosition = { x: halfBoardSize, y: halfBoardSize };
    });

    it('should be created', () => {
        expect(boardValidator).to.be.ok;
    });

    it('should accept a valid word', () => {
        const response = boardValidator.validate(generatePlacement(WORDS[0], centerPosition, Direction.Right));
        expect(response.isSuccess).to.be.true;
    });

    it('should fail to add an invalid word', () => {
        const response = boardValidator.validate(generatePlacement('thisisnotaword', centerPosition, Direction.Right));
        expect(response.isSuccess).to.be.false;
    });

    it('should fail to add a word written from right to left', () => {
        const response = boardValidator.validate(generatePlacement(WORDS[0], centerPosition, Direction.Left));
        expect(response.isSuccess).to.be.false;
    });

    it('should fail to overflow the board', () => {
        const response = boardValidator.validate(generatePlacement('aaaaaaaaaaaaaaa', centerPosition, Direction.Right));
        expect(response.isSuccess).to.be.false;
    });

    it('should fail to add an un-centered first word', () => {
        const response = boardValidator.validate(generatePlacement(WORDS[0], { x: 0, y: 0 }, Direction.Right));
        expect(response.isSuccess).to.be.false;
    });

    it('should succeed and return correct score on valid placement', () => {
        const expectedScore = 18;
        const response = boardValidator.validate(generatePlacement(WORDS[5], centerPosition, Direction.Down));
        expect(response.isSuccess).to.be.true;
        expect(response.points).to.equal(expectedScore);
    });

    it('should succeed and return correct score on valid combination', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Need to set expected score
        const expectedScores = [20, 13];
        const FIRST_PLACEMENT = generatePlacement('pomme', centerPosition, Direction.Right);
        const COMBINED_WORD: Placement[] = [
            { letter: 'e', position: { x: 7, y: 8 } },
            { letter: 'c', position: { x: 7, y: 9 } },
            { letter: 'h', position: { x: 7, y: 10 } },
            { letter: 'e', position: { x: 7, y: 11 } },
        ];

        expect(boardValidator.validate(FIRST_PLACEMENT)).to.eql({ isSuccess: true, points: expectedScores[0], description: '' });
        board.merge(FIRST_PLACEMENT);

        expect(boardValidator.validate(COMBINED_WORD)).to.eql({ isSuccess: true, points: expectedScores[1], description: '' });
    });

    it('should fail if word combination is invalid', () => {
        board.merge(generatePlacement('pomme', centerPosition, Direction.Right));
        expect(boardValidator.validate(generatePlacement('raisin', { x: centerPosition.x - 1, y: centerPosition.y }, Direction.Down)).isSuccess)
            .false;
    });

    it('should fail if word coherence is invalid', () => {
        const COMBINED_WORD: Vec2[] = [
            { x: 11, y: 3 },
            { x: 11, y: 4 },
            { x: 11, y: 5 },
            { x: 11, y: 6 },
            { x: 11, y: 8 },
        ];

        // eslint-disable-next-line dot-notation -- Needs to access private property for testing
        expect(BoardValidator['ensureCoherence'](board, COMBINED_WORD, Direction.Down)).to.be.false;
    });

    it('should fail if placement is empty', () => {
        expect(boardValidator.validate([]).isSuccess).to.be.false;
    });

    it('should fail if not aggregated with other placements', () => {
        expect(boardValidator.validate([]).isSuccess).to.be.false;
    });

    it('should fail if letters are placed on different lines', () => {
        const COMBINED_WORD: Placement[] = [
            { letter: 'p', position: { x: 7, y: 7 } },
            { letter: 'o', position: { x: 7, y: 8 } },
            { letter: 'm', position: { x: 7, y: 9 } },
            { letter: 'm', position: { x: 7, y: 10 } },
            { letter: 'e', position: { x: 7, y: 11 } },
            { letter: 'e', position: { x: 8, y: 9 } },
        ];
        expect(boardValidator.validate(COMBINED_WORD).isSuccess).to.be.false;
    });

    it('should fail if all words are not connected', () => {
        board.merge(generatePlacement(WORDS[0], centerPosition, Direction.Right));

        expect(boardValidator.validate(generatePlacement(WORDS[0], { x: 0, y: 0 }, Direction.Right)).isSuccess).to.be.false;
    });

    it('should fail if first placement as only one letter', () => {
        expect(boardValidator.validate(generatePlacement('a', centerPosition, Direction.Right)).isSuccess).to.be.false;
    });
    it('retrieve Direction should return Direction.None if weird placement', () => {
        const BAD_PLACEMENT: Vec2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];
        expect(boardValidator['retrieveDirection'](BAD_PLACEMENT)).to.eql(Direction.None);
    });
    it('retrieve Direction should return Direction.None if weird placement modified', () => {
        const BAD_PLACEMENT_MODIFIED: Vec2[] = [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ];
        expect(boardValidator['retrieveDirection'](BAD_PLACEMENT_MODIFIED)).to.eql(Direction.None);
    });

    it('retrieve Direction should return Direction.None if weird placement modified again', () => {
        const BAD_PLACEMENT_MODIFIED: Vec2[] = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 0 },
        ];
        expect(boardValidator['retrieveDirection'](BAD_PLACEMENT_MODIFIED)).to.eql(Direction.None);
    });
});
