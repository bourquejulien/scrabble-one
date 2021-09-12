import { BoardError } from '@app/exceptions/board-error';
import { Board, ImmutableBoard } from './board';
import { Square } from './square';
import { ValidationResponse } from './validation-response';
import { Vec2 } from './vec2';

enum Direction {
    Horizontal,
    Vertical,
    None,
}

export class BoardValidator {
    constructor(private board: ImmutableBoard, private lookup: (word: string) => boolean, letterValues: { [key: string]: number }) { }

    private static validateIfSquareFilled(square: Square | null): boolean {
        return square != null && square.letter !== '';
    }

    private static sortLetters(letters: [string, Vec2][], direction: Direction): [string, Vec2][] {
        if (direction === Direction.Horizontal) {
            return letters.sort((l1, l2) => l1[1].x - l2[1].x);
        } else {
            return letters.sort((l1, l2) => l1[1].y - l2[1].y);
        }
    }

    validate(letters: [string, Vec2][]): ValidationResponse {
        if (letters.length === 0) {
            return { isSuccess: false, description: 'Empty placement', points: 0 };
        }

        const positions: Vec2[] = letters.map((e) => e[1]);
        const clonedBoard = this.board.clone();

        try {
            clonedBoard.merge(letters);
        } catch (error) {
            if (error instanceof BoardError) {
                return { isSuccess: false, description: error.message, points: 0 };
            }

            throw error;
        }

        if (this.board.filledSquare === 0) {
            if (!this.validateFirstPlacement(letters)) return { isSuccess: false, description: 'Invalid first word', points: 0 };
        } else if (!this.ensureCoherence(positions)) {
            return { isSuccess: false, description: 'Invalid coherence', points: 0 };
        }

        const direction: Direction = this.retrieveDirection(positions);

        if (direction === Direction.None) {
            return { isSuccess: false, description: 'Letters needs to be placed on the same line', points: 0 };
        }

        const sortedLetters = BoardValidator.sortLetters(letters, direction);

        return this.validateWords(clonedBoard, sortedLetters, direction);
    }

    private validateFirstPlacement(letters: [string, Vec2][]): boolean {
        if (letters.length < 2) {
            return false;
        }
        for (const [, position] of letters) {
            if (position.x === 0 && position.y === 0) return true;
        }
        return false;
    }

    private ensureCoherence(positions: Vec2[]): boolean {
        for (const position of positions) {
            if (
                BoardValidator.validateIfSquareFilled(this.board.left(position)) ||
                BoardValidator.validateIfSquareFilled(this.board.right(position)) ||
                BoardValidator.validateIfSquareFilled(this.board.up(position)) ||
                BoardValidator.validateIfSquareFilled(this.board.down(position))
            ) {
                return true;
            }
        }
        return false;
    }

    private retrieveDirection(positions: Vec2[]): Direction {
        if (positions.length < 2) return Direction.None;

        const firstPosition: Vec2 = positions[0];
        const secondPosition: Vec2 = positions[1];

        let direction: Direction;

        if (firstPosition.x === secondPosition.x) {
            direction = Direction.Vertical;
        } else if (firstPosition.y === secondPosition.y) {
            direction = Direction.Horizontal;
        } else {
            return Direction.None;
        }

        for (let i = 2; i < positions.length; i++) {
            if (positions[i - 1].x === positions[i].x) {
                if (direction !== Direction.Vertical) return Direction.None;
            } else if (positions[i - 1].y === positions[i].y) {
                if (direction !== Direction.Horizontal) return Direction.None;
            } else {
                return Direction.None;
            }
        }

        return direction;
    }

    private validateWords(clonedBoard: Board, sortedLetters: [string, Vec2][], direction: Direction): ValidationResponse {
        // TODO
    }
}
