import { TestBed } from '@angular/core/testing';
import { Direction } from '@app/classes/direction';
import { Vec2 } from '@app/classes/vec2';

import { BoardService } from './board.service';
import { DictionaryService } from './dictionary.service';

const words: string[] = ['pomme', 'orange', 'poire', 'raisin', 'peche', 'banane'];
const mockedDictionary: Set<string> = new Set(words);

const generatePlacement = (word: string, initialPosition: Vec2, direction: Direction): [string, Vec2][] => {
    const letters = new Array<[string, Vec2]>();

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
        letters.push([word[i], { x: initialPosition.x + xIncr * i, y: initialPosition.y + yIncr * i }]);
    }

    return letters;
};

class MockDictionaryService extends DictionaryService {
    lookup(word: string): boolean {
        return mockedDictionary.has(word);
    }
}

describe('BoardService', () => {
    let service: BoardService;
    let centerPosition: Vec2;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: DictionaryService, useClass: MockDictionaryService }],
        });
        service = TestBed.inject(BoardService);
        const halfBoardSize = Math.floor(service.gameBoard.size / 2);
        centerPosition = { x: halfBoardSize, y: halfBoardSize };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should accept a valid word', () => {
        const response = service.validateWord(generatePlacement(words[0], centerPosition, Direction.Right));
        expect(response.isSuccess).toBeTrue();
    });

    it('should fail to add an invalid word', () => {
        const response = service.validateWord(generatePlacement('thisisnotaword', centerPosition, Direction.Right));
        expect(response.isSuccess).toBeFalse();
    });

    it('should fail to add a word written from right to left', () => {
        const response = service.validateWord(generatePlacement(words[0], centerPosition, Direction.Left));
        expect(response.isSuccess).toBeFalse();
    });

    it('should fail to overflow the board', () => {
        const response = service.validateWord(generatePlacement('aaaaaaaaaaaaaaa', centerPosition, Direction.Right));
        expect(response.isSuccess).toBeFalse();
    });

    it('should fail to add an un-centered first word', () => {
        const response = service.validateWord(generatePlacement(words[0], { x: 0, y: 0 }, Direction.Right));
        expect(response.isSuccess).toBeFalse();
    });

    it('should succeed and return correct score on valid placement', () => {
        const expectedScore = 9;
        const response = service.addWord(generatePlacement(words[5], centerPosition, Direction.Down));
        expect(response.isSuccess).toBeTrue();
        expect(response.points).toEqual(expectedScore);
    });

    it('should succeed and return correct score on valid combination', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Need to set expected score
        const expectedScores = [10, 24];
        const combinedWord: [string, Vec2][] = [
            ['p', { x: 11, y: 3 }],
            ['e', { x: 11, y: 4 }],
            ['c', { x: 11, y: 5 }],
            ['h', { x: 11, y: 6 }],
        ];
        const responses = [service.addWord(generatePlacement('pomme', centerPosition, Direction.Right)), service.addWord(combinedWord)];
        for (let i = 0; i < responses.length; i++) {
            expect(responses[i].isSuccess).toBe(true);
            expect(responses[i].points).toEqual(expectedScores[i]);
        }
    });

    it('should fail if word combination is invalid', () => {
        const responses = [
            service.addWord(generatePlacement(words[0], centerPosition, Direction.Right)),
            service.addWord(generatePlacement(words[1], { x: centerPosition.x + words[1].length, y: centerPosition.y - 1 }, Direction.Down)),
        ];

        expect(responses[0].isSuccess).toBe(true);
        expect(responses[1].isSuccess).toBe(false);
    });

    it('should fail if all words are not connected', () => {
        const responses = [
            service.addWord(generatePlacement(words[0], centerPosition, Direction.Right)),
            service.addWord(generatePlacement(words[1], { x: centerPosition.x + words[1].length + 1, y: centerPosition.y - 1 }, Direction.Down)),
        ];

        expect(responses[0].isSuccess).toBe(true);
        expect(responses[1].isSuccess).toBe(false);
    });

    it('should fail if word conflicts', () => {
        expect(service.addWord(generatePlacement(words[0], centerPosition, Direction.Right)).isSuccess).toBe(true);
        expect(service.addWord(generatePlacement(words[0], centerPosition, Direction.Right)).isSuccess).toBe(false);
    });
});
