import { BoardError } from '@app/errors/board-error';
import { Board, ImmutableBoard } from '@app/classes/board/board';
import { Square } from '@app/classes/board/square';
import { ValidationResponse } from './validation-response';
import { Vec2 } from '@common';
import { Direction, reverseDirection } from '@app/classes/board/direction';
import { Bonus, getBonusDetails } from '@app/classes/board/bonus';
import { Dictionary } from '@app/classes/dictionary/dictionary';
import { Config } from '@app/config';

export class BoardValidator {
    constructor(private readonly board: ImmutableBoard, private readonly dictionary: Dictionary, private letterPoints: { [key: string]: number }) {}

    private static validateSquare(square: Square | null): boolean {
        return square != null && square.letter !== '';
    }

    private static sortLetters(letters: { letter: string; position: Vec2 }[], direction: Direction): { letter: string; position: Vec2 }[] {
        if (direction === Direction.Right) {
            return letters.sort((l1, l2) => l1.position.x - l2.position.x);
        } else {
            return letters.sort((l1, l2) => l1.position.y - l2.position.y);
        }
    }

    private static ensureCoherence(clonedBoard: Board, sortedPositions: Vec2[], direction: Direction): boolean {
        const initialPosition = sortedPositions[0];
        const finalPosition = sortedPositions[sortedPositions.length - 1];

        let square: Square | null = clonedBoard.getSquare(initialPosition);

        while (square != null && square.letter !== '') {
            if (square.position === finalPosition) {
                return true;
            }

            square = clonedBoard.getRelative(square.position, direction);
        }

        return false;
    }

    private static getFirstPosition(clonedBoard: Board, startPosition: Vec2, direction: Direction): Vec2 {
        let square = clonedBoard.getRelative(startPosition, reverseDirection(direction));
        let position = startPosition;

        while (square != null && square.letter !== '') {
            position = square.position;
            square = clonedBoard.getRelative(square.position, reverseDirection(direction));
        }

        return position;
    }

    validate(letters: { letter: string; position: Vec2 }[]): ValidationResponse {
        if (letters.length === 0) {
            return { isSuccess: false, description: 'Empty placement', points: 0 };
        }

        const positions: Vec2[] = letters.map((e) => e.position);
        const clonedBoard: Board = this.board.clone();

        try {
            clonedBoard.merge(letters);
        } catch (error) {
            if (error instanceof BoardError) {
                return { isSuccess: false, description: error.message, points: 0 };
            }

            throw error;
        }

        const direction: Direction = this.retrieveDirection(positions);

        if (direction === Direction.None) {
            return { isSuccess: false, description: 'Letters needs to be placed on the same line', points: 0 };
        }

        const sortedLetters = BoardValidator.sortLetters(letters, direction);
        const sortedPositions = sortedLetters.map((e) => e.position);

        if (this.board.positions.length === 0) {
            if (!this.validateFirstPlacement(letters)) return { isSuccess: false, description: 'Invalid first word', points: 0 };
        } else if (!this.ensureAggregation(positions)) {
            return { isSuccess: false, description: 'No aggregation', points: 0 };
        }

        if (!BoardValidator.ensureCoherence(clonedBoard, sortedPositions, direction)) {
            return { isSuccess: false, description: 'Invalid coherence', points: 0 };
        }

        return this.validateWords(clonedBoard, sortedPositions, direction);
    }

    getLetterPoints(letter: string): number {
        return this.letterPoints[letter] ?? 0;
    }

    private validateFirstPlacement(letters: { letter: string; position: Vec2 }[]): boolean {
        if (letters.length < 2) {
            return false;
        }

        const halfBoardSize = Math.floor(this.board.size / 2);
        for (const { position } of letters) {
            if (position.x === halfBoardSize && position.y === halfBoardSize) return true;
        }

        return false;
    }

    private ensureAggregation(positions: Vec2[]): boolean {
        for (const position of positions) {
            if (
                BoardValidator.validateSquare(this.board.getRelative(position, Direction.Left)) ||
                BoardValidator.validateSquare(this.board.getRelative(position, Direction.Right)) ||
                BoardValidator.validateSquare(this.board.getRelative(position, Direction.Up)) ||
                BoardValidator.validateSquare(this.board.getRelative(position, Direction.Down))
            ) {
                return true;
            }
        }
        return false;
    }

    private retrieveDirection(positions: Vec2[]): Direction {
        if (positions.length < 2) return Direction.Right;

        const firstPosition: Vec2 = positions[0];
        const secondPosition: Vec2 = positions[1];

        let direction: Direction;

        if (firstPosition.x === secondPosition.x) {
            direction = Direction.Down;
        } else if (firstPosition.y === secondPosition.y) {
            direction = Direction.Right;
        } else {
            return Direction.None;
        }

        for (let i = 2; i < positions.length; i++) {
            if (positions[i - 1].x === positions[i].x) {
                if (direction !== Direction.Down) return Direction.None;
            } else if (positions[i - 1].y === positions[i].y) {
                if (direction !== Direction.Right) return Direction.None;
            } else {
                return Direction.None;
            }
        }

        return direction;
    }

    private validateWords(clonedBoard: Board, sortedPositions: Vec2[], direction: Direction): ValidationResponse {
        let totalPoint = 0;

        let response = this.validateWord(clonedBoard, sortedPositions[0], direction);
        if (!response.isSuccess) {
            return response;
        }
        totalPoint += response.points;

        for (const position of sortedPositions) {
            response = this.validateWord(clonedBoard, position, direction === Direction.Down ? Direction.Right : Direction.Down);
            if (!response.isSuccess) {
                return response;
            }

            totalPoint += response.points;
        }

        totalPoint += this.getBingoBonus(sortedPositions.length);

        return { isSuccess: true, description: '', points: totalPoint };
    }

    private validateWord(clonedBoard: Board, initialPosition: Vec2, direction: Direction): ValidationResponse {
        const firstPosition = BoardValidator.getFirstPosition(clonedBoard, initialPosition, direction);

        let nextSquare: Square | null = clonedBoard.getSquare(firstPosition);
        let word = '';
        let totalPoint = 0;
        let multiplier = 1;

        while (nextSquare != null && nextSquare.letter !== '') {
            const currentSquare = nextSquare;
            const isBonus = currentSquare.bonus !== Bonus.None && this.board.getSquare(currentSquare.position).letter === '';

            nextSquare = clonedBoard.getRelative(currentSquare.position, direction);
            word += currentSquare.letter.toLowerCase();

            if (!isBonus) {
                totalPoint += this.getLetterPoints(currentSquare.letter);
                continue;
            }

            const bonusDetails = getBonusDetails(currentSquare.bonus);
            if (bonusDetails.isLetterBonus) {
                totalPoint += this.getLetterPoints(currentSquare.letter) * bonusDetails.score;
            } else {
                totalPoint += this.getLetterPoints(currentSquare.letter);
                multiplier *= bonusDetails.score;
            }
        }

        if (word.length < 2) {
            return { isSuccess: true, description: '', points: 0 };
        }

        if (this.dictionary.lookup(word)) {
            return { isSuccess: true, description: '', points: totalPoint * multiplier };
        } else {
            return { isSuccess: false, description: `Word: (${word}) cannot be found in dictionary`, points: 0 };
        }
    }

    private getBingoBonus(placementLength: number): number {
        const BINGO_BONUS = 50;
        return placementLength > Config.RACK_SIZE ? BINGO_BONUS : 0;
    }
}
