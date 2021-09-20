import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Direction } from '@app/classes/board/direction';
import { Vec2 } from '@app/classes/vec2';

import { BoardService } from '@app/services/board/board.service';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';

const WORDS: string[] = ['pomme', 'orange', 'poire', 'raisin', 'peche', 'banane', 'bananes'];
const mockedDictionary: Set<string> = new Set(WORDS);

const generatePlacement = (word: string, initialPosition: Vec2, direction: Direction): { letter: string; position: Vec2 }[] => {
    const letters: { letter: string; position: Vec2 }[] = [];

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

@Injectable({
    providedIn: 'root',
})
class StubDictionaryService {
    lookup(word: string): boolean {
        return mockedDictionary.has(word);
    }
}

describe('BoardService', () => {
    let service: BoardService;
    let centerPosition: Vec2;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: DictionaryService, useClass: StubDictionaryService }],
        });
        service = TestBed.inject(BoardService);
        const halfBoardSize = Math.floor(service.gameBoard.size / 2);
        centerPosition = { x: halfBoardSize, y: halfBoardSize };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should accept a valid word', () => {
        const response = service.validateLetters(generatePlacement(WORDS[0], centerPosition, Direction.Right));
        expect(response.isSuccess).toBeTrue();
    });

    it('should fail to add an invalid word', () => {
        const response = service.validateLetters(generatePlacement('thisisnotaword', centerPosition, Direction.Right));
        expect(response.isSuccess).toBeFalse();
    });

    it('should fail to add a word written from right to left', () => {
        const response = service.validateLetters(generatePlacement(WORDS[0], centerPosition, Direction.Left));
        expect(response.isSuccess).toBeFalse();
    });

    it('should fail to overflow the board', () => {
        const response = service.validateLetters(generatePlacement('aaaaaaaaaaaaaaa', centerPosition, Direction.Right));
        expect(response.isSuccess).toBeFalse();
    });

    it('should fail to add an un-centered first word', () => {
        const response = service.validateLetters(generatePlacement(WORDS[0], { x: 0, y: 0 }, Direction.Right));
        expect(response.isSuccess).toBeFalse();
    });

    it('should succeed and return correct score on valid placement', () => {
        const expectedScore = 9;
        const response = service.placeLetters(generatePlacement(WORDS[5], centerPosition, Direction.Down));
        expect(response.isSuccess).toBeTrue();
        expect(response.points).toEqual(expectedScore);
    });

    it('should succeed and return correct score on valid combination', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- Need to set expected score
        const expectedScores = [10, 24];
        const combinedWord: { letter: string; position: Vec2 }[] = [
            { letter: 'p', position: { x: 11, y: 3 } },
            { letter: 'e', position: { x: 11, y: 4 } },
            { letter: 'c', position: { x: 11, y: 5 } },
            { letter: 'h', position: { x: 11, y: 6 } },
        ];
        const responses = [service.placeLetters(generatePlacement('pomme', centerPosition, Direction.Right)), service.placeLetters(combinedWord)];
        for (let i = 0; i < responses.length; i++) {
            expect(responses[i].isSuccess).toBe(true);
            expect(responses[i].points).toEqual(expectedScores[i]);
        }
    });

    it('should fail if word combination is invalid', () => {
        const responses = [
            service.placeLetters(generatePlacement(WORDS[0], centerPosition, Direction.Right)),
            service.placeLetters(generatePlacement(WORDS[1], { x: centerPosition.x + WORDS[1].length, y: centerPosition.y - 1 }, Direction.Down)),
        ];

        expect(responses[0].isSuccess).toBe(true);
        expect(responses[1].isSuccess).toBe(false);
    });

    it('should fail if all words are not connected', () => {
        const responses = [
            service.placeLetters(generatePlacement(WORDS[0], centerPosition, Direction.Right)),
            service.placeLetters(generatePlacement(WORDS[1], { x: centerPosition.x + WORDS[1].length + 1, y: centerPosition.y - 1 }, Direction.Down)),
        ];

        expect(responses[0].isSuccess).toBe(true);
        expect(responses[1].isSuccess).toBe(false);
    });

    it('should fail if word conflicts', () => {
        expect(service.placeLetters(generatePlacement(WORDS[0], centerPosition, Direction.Right)).isSuccess).toBe(true);
        expect(service.placeLetters(generatePlacement(WORDS[0], centerPosition, Direction.Right)).isSuccess).toBe(false);
    });

    it('should retrieve only new letters', () => {
        service.placeLetters(generatePlacement(WORDS[5], centerPosition, Direction.Right));

        let newLetters = service.retrieveNewLetters(WORDS[6], centerPosition, Direction.Right);
        expect(newLetters).toEqual([{ letter: 's', position: { x: centerPosition.x + WORDS[6].length - 1, y: centerPosition.y } }]);

        newLetters = service.retrieveNewLetters(WORDS[5], centerPosition, Direction.Right);
        expect(newLetters).toEqual([]);

        newLetters = service.retrieveNewLetters(WORDS[5] + WORDS[5], centerPosition, Direction.Right);
        expect(newLetters).toEqual([]);
    });
});
