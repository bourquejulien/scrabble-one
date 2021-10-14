import { Direction, reverseDirection } from '@app/classes/board/direction';
import { ImmutableBoard } from '@app/classes/board/board';
import { Dictionary } from '@app/classes/dictionary/dictionary';
import { Vec2, Square } from '@common';
import { Play } from './play';
import { BoardHandler } from '@app/classes/board/board-handler';

interface PositionedWord {
    word: string;
    startPosition: number;
}

export class PlayGenerator {
    private readonly plays: Play[];
    private readonly board: ImmutableBoard;
    private readonly dictionary: Dictionary;
    private readonly boardHandler: BoardHandler;
    private readonly availableLetters: string[];
    private readonly positionsToTry: Vec2[];

    constructor(dictionary: Dictionary, boardHandler: BoardHandler, availableLetters: string[]) {
        this.plays = [];

        this.board = boardHandler.immutableBoard;
        this.positionsToTry = this.board.positions.length === 0 ? [this.board.center] : this.board.positions;
        this.dictionary = dictionary;
        this.boardHandler = boardHandler;
        this.availableLetters = availableLetters;
    }

    private static getRandomPosition(excludedMax: number): number {
        return Math.floor(Math.random() * excludedMax);
    }

    generateNext(): boolean {
        const positionIndex = PlayGenerator.getRandomPosition(this.positionsToTry.length);
        const position = this.positionsToTry.splice(positionIndex, 1);
        this.tryGenerate(position[0], Direction.Right);
        this.tryGenerate(position[0], Direction.Down);

        return this.positionsToTry.length !== 0;
    }

    get orderedPlays(): Play[] {
        return Array.from(this.plays).sort((a, b) => b.score - a.score);
    }

    private tryGenerate(position: Vec2, direction: Direction): void {
        const startPosition = this.retrieveStartPosition(position, direction);
        const existingWord = this.retrieveExistingWord(startPosition, direction);

        const foundWords = this.findWords(existingWord, direction === Direction.Right ? startPosition.x : startPosition.y);

        for (const positionedWord of foundWords) {
            const letters = this.boardHandler.retrieveNewLetters(
                positionedWord.word,
                direction === Direction.Right
                    ? { x: positionedWord.startPosition, y: startPosition.y }
                    : { x: startPosition.x, y: positionedWord.startPosition },
                direction,
            );
            const response = this.boardHandler.lookupLetters(letters);
            if (response.isSuccess) {
                this.plays.push({ score: response.points, word: positionedWord.word, letters });
            }
        }
    }

    private retrieveStartPosition(position: Vec2, direction: Direction) {
        const reversedDirection = reverseDirection(direction);
        let square = this.board.getRelative(position, reversedDirection);

        while (square != null && square.letter !== '') {
            position = square.position;
            square = this.board.getRelative(square.position, reversedDirection);
        }

        return position;
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

    private findWords(startWord: string, startPosition: number): PositionedWord[] {
        const generatedWords: PositionedWord[] = [];
        this.findWord(generatedWords, this.availableLetters, { word: startWord, startPosition }, true);
        this.findWord(generatedWords, this.availableLetters, { word: startWord, startPosition }, false);

        return generatedWords;
    }

    private findWord(generatedWords: PositionedWord[], letters: string[], startWord: PositionedWord, isForward: boolean) {
        for (let index = 0; index < letters.length; index++) {
            const positionedWord = Object.assign({}, startWord);

            if (isForward) {
                positionedWord.word = startWord.word + letters[index];
            } else {
                positionedWord.word = letters[index] + startWord.word;
                positionedWord.startPosition--;
            }

            const { isWord, isOther: isOtherStart } = this.dictionary.lookUpStart(positionedWord.word);

            const isOtherEnd = this.dictionary.lookUpEnd(positionedWord.word);

            if (isWord) {
                generatedWords.push(positionedWord);
            }

            const clonedLetters = letters.slice();
            clonedLetters.splice(index, 1);

            if (isOtherStart) {
                this.findWord(generatedWords, clonedLetters, positionedWord, true);
            }

            if (isOtherEnd) {
                this.findWord(generatedWords, clonedLetters, positionedWord, false);
            }
        }
    }
}
