import { Board, ImmutableBoard } from '@app/classes/board/board';
import { Dictionary } from '@app/classes/dictionary/dictionary';
import { Config } from '@app/config';
import { Bonus, Direction, getBonusDetails, Placement, reverseDirection, Square, Vec2 } from '@common';
import { ValidatedLetter, ValidatedWord, ValidationFailed, ValidationResponse } from './validation-response';

export class BoardValidator {
    constructor(private readonly board: ImmutableBoard, private readonly dictionary: Dictionary, private letterPoints: { [key: string]: number }) {}
    private static validateSquare(square: Square | null): boolean {
        return square != null && square.letter !== '';
    }

    private static sortLetters(letters: Placement[], direction: Direction): Placement[] {
        if (direction === Direction.Right) {
            return letters.sort((l1, l2) => l1.position.x - l2.position.x);
        }
        return letters.sort((l1, l2) => l1.position.y - l2.position.y);
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

    private static retrieveDirection(positions: Vec2[]): Direction {
        if (positions.length < 2) {
            return Direction.Right;
        }

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
            const previousPosition = positions[i - 1];
            const currentPosition = positions[i];
            if (previousPosition.x === currentPosition.x) {
                if (direction !== Direction.Down) {
                    return Direction.None;
                }
            } else if (previousPosition.y ===currentPosition.y) {
                if (direction !== Direction.Right) {
                    return Direction.None;
                }
            } else {
                return Direction.None;
            }
        }

        return direction;
    }

    private static getBingoBonus(placementLength: number): number {
        const BINGO_BONUS = 50;
        return placementLength > Config.RACK_SIZE ? BINGO_BONUS : 0;
    }

    validate(placements: Placement[]): ValidationResponse {
        if (placements.length === 0) {
            return { isSuccess: false, description: 'Aucune lettre à valider' };
        }

        const positions: Vec2[] = placements.map((e) => e.position);
        const clonedBoard: Board = this.board.clone();

        try {
            clonedBoard.merge(placements);
        } catch (error) {
            return { isSuccess: false, description: 'Impossible de remplacer une lettre existante' };
        }

        const direction: Direction = BoardValidator.retrieveDirection(positions);

        if (direction === Direction.None) {
            return { isSuccess: false, description: 'Toutes les lettres doivent être placées sur la même ligne' };
        }

        const sortedLetters = BoardValidator.sortLetters(placements, direction);
        const sortedPositions = sortedLetters.map((e) => e.position);

        if (this.board.positions.length === 0) {
            if (!this.validateFirstPlacement(placements)) {
                return { isSuccess: false, description: 'Premier mot invalide, est-il placé au bon endroit?' };
            }
        } else if (!this.ensureAggregation(positions)) {
            return { isSuccess: false, description: "Le mot placé n'est pas lié au jeu" };
        }

        if (!BoardValidator.ensureCoherence(clonedBoard, sortedPositions, direction)) {
            return { isSuccess: false, description: 'Mot incohérent' };
        }

        const response = this.validateWords(clonedBoard, sortedPositions, direction);

        if ('isSuccess' in response) {
            return response;
        }

        const score = response.map((w) => w.score).reduce((prev, curr) => prev + curr) + BoardValidator.getBingoBonus(sortedPositions.length);

        return { isSuccess: true, score, placements, words: response };
    }

    getLetterScore(letter: string): number {
        return this.letterPoints[letter] ?? 0;
    }

    private validateFirstPlacement(letters: Placement[]): boolean {
        if (letters.length < 2) {
            return false;
        }

        const halfBoardSize = Math.floor(this.board.size / 2);
        for (const { position } of letters) {
            if (position.x === halfBoardSize && position.y === halfBoardSize) {
                return true;
            }
        }

        return false;
    }

    private ensureAggregation(positions: Vec2[]): boolean {
        for (const position of positions) {
            const isLeftSquareValid = BoardValidator.validateSquare(this.board.getRelative(position, Direction.Left));
            const isRightSquareValid = BoardValidator.validateSquare(this.board.getRelative(position, Direction.Right));
            const isUpSquareValid = BoardValidator.validateSquare(this.board.getRelative(position, Direction.Up));
            const isDownSquareValid = BoardValidator.validateSquare(this.board.getRelative(position, Direction.Down));
            const allSquareAroundValid = isLeftSquareValid || isRightSquareValid || isUpSquareValid || isDownSquareValid;
            if (allSquareAroundValid) {
                return true;
            }
        }
        return false;
    }

    private validateWords(clonedBoard: Board, sortedPositions: Vec2[], direction: Direction): ValidationFailed | ValidatedWord[] {
        const words: ValidatedWord[] = [];
        const addWord = (word: ValidatedWord): void => {
            if (word.score > 0) words.push(word);
        };

        let validationResponse = this.validateWord(clonedBoard, sortedPositions[0], direction);
        if ('isSuccess' in validationResponse) {
            return validationResponse;
        }

        addWord(validationResponse);

        for (const position of sortedPositions) {
            validationResponse = this.validateWord(clonedBoard, position, direction === Direction.Down ? Direction.Right : Direction.Down);
            if ('isSuccess' in validationResponse) {
                return validationResponse;
            }

            addWord(validationResponse);
        }

        return words;
    }

    private validateWord(clonedBoard: Board, initialPosition: Vec2, direction: Direction): ValidatedWord | ValidationFailed {
        const firstPosition = BoardValidator.getFirstPosition(clonedBoard, initialPosition, direction);
        const letters: ValidatedLetter[] = [];

        let nextSquare: Square | null = clonedBoard.getSquare(firstPosition);
        let word = '';
        let totalPoint = 0;
        let multiplier = 1;

        while (nextSquare != null && nextSquare.letter !== '') {
            const currentSquare = nextSquare;
            const isNew = this.board.getSquare(currentSquare.position).letter === '';
            const isBonus = currentSquare.bonus !== Bonus.None && isNew;

            nextSquare = clonedBoard.getRelative(currentSquare.position, direction);
            word += currentSquare.letter.toLowerCase();

            const letterScore = this.getLetterScore(currentSquare.letter);
            const bonusDetails = getBonusDetails(currentSquare.bonus);

            if (!isBonus) {
                totalPoint += letterScore;
            } else if (bonusDetails.isLetterBonus) {
                totalPoint += this.getLetterScore(currentSquare.letter) * bonusDetails.score;
            } else {
                totalPoint += this.getLetterScore(currentSquare.letter);
                multiplier *= bonusDetails.score;
            }

            const placement: Placement = { position: currentSquare.position, letter: currentSquare.letter };
            letters.push({ placement, isNew });
        }

        if (word.length < 2) {
            return { score: 0, letters };
        }

        if (this.dictionary.lookup(word)) {
            return { score: totalPoint * multiplier, letters };
        }

        return { isSuccess: false, description: `Le mot : (${word}) n'existe pas dans le dictionnaire` };
    }
}
