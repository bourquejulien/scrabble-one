import { Direction, reverseDirection } from '@app/classes/board/direction';
import { ImmutableBoard } from '@app/classes/board/board';
import { DictionaryLookup } from '@app/classes/dictionary/dictionary-lookup';
import { ValidationLookup } from '@app/classes/validation/validation-lookup';
import { Vec2 } from '@app/classes/vec2';
import { Play } from './play';
import { Square } from '@app/classes/board/square';

export class PlayGenerator {
    private readonly plays: Play[];
    private readonly board: ImmutableBoard;
    private readonly dictionaryLookup: DictionaryLookup;
    private readonly validationLookup: ValidationLookup;
    private readonly availableLetters: string[];
    private readonly positionsToTry: Vec2[];

    constructor(board: ImmutableBoard, dictionaryLookup: DictionaryLookup, validationLookup: ValidationLookup, availableLetters: string[]) {
        this.plays = [];

        this.board = board;
        this.positionsToTry = board.positions.length === 0 ? [board.center] : board.positions;
        this.dictionaryLookup = dictionaryLookup;
        this.validationLookup = validationLookup;
        this.availableLetters = availableLetters;
    }

    private static getRandomPosition(excludedMax: number): number {
        return Math.floor(Math.random() * excludedMax);
    }

    generateNext(): boolean {
        const positionIndex = PlayGenerator.getRandomPosition(this.positionsToTry.length);
        const position = this.positionsToTry.splice(positionIndex);
        this.tryGenerate(position[0], Direction.Right);
        this.tryGenerate(position[0], Direction.Down);

        return this.positionsToTry.length !== 0;
    }

    get orderedPlays(): Play[] {
        return Array.from(this.plays).sort((a, b) => b.score - a.score);
    }

    private tryGenerate(position: Vec2, direction: Direction): void {
        const firstPosition = this.retrieveEndPosition(position, reverseDirection(direction));
        const existingWord = this.retrieveExistingWord(firstPosition, direction);

        const foundWords = this.findWords(existingWord);

        for (const word of foundWords) {
            const letters = this.validationLookup.retrieveNewLetters(word, firstPosition, direction);
            const response = this.validationLookup.lookupLetters(letters);
            if (response.isSuccess) {
                this.plays.push({ score: response.points, letters });
            }
        }
    }

    private retrieveExistingWord(firstPosition: Vec2, direction: Direction): string {
        let word = '';
        let square: Square | null = this.board.getSquare(firstPosition);

        while (square != null && square.letter !== '') {
            word += square.letter;
            square = this.board.getRelative(square.position, direction);
        }

        return word;
    }

    private retrieveEndPosition(position: Vec2, direction: Direction) {
        let square = this.board.getRelative(position, direction);

        while (square != null && square.letter !== '') {
            position = square.position;
            square = this.board.getRelative(square.position, direction);
        }

        return position;
    }

    private findWords(startWord: string): string[] {
        const generatedWords: string[] = [];
        this.findWord(generatedWords, this.availableLetters, startWord);

        return generatedWords;
    }

    private findWord(generatedWords: string[], letters: string[], startWord: string) {
        for (const letter of letters) {
            const word = startWord + letter;
            const { isWord, isOther } = this.dictionaryLookup.lookUpStart(word);

            if (isWord) {
                generatedWords.push(word);
            }

            if (isOther && letters.length > 1) {
                this.findWord(generatedWords, letters.slice(0, -1), word);
            }
        }
    }
}
