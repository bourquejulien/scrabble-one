/* eslint-disable max-classes-per-file */
import { PlayerData } from '@app/classes/player-data';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Vec2 } from '@app/classes/vec2';
import { Play } from '@app/classes/virtual-player/play';
import { BoardService } from '@app/services/board/board.service';
import { PlaceAction } from './place-action';

const ZERO_VEC2 = { x: 0, y: 0 };
const LETTERS = ['a', 'b', 'c'];
const LETTERS_PAIR = [
    { letter: LETTERS[0], position: ZERO_VEC2 },
    { letter: LETTERS[1], position: ZERO_VEC2 },
    { letter: LETTERS[2], position: ZERO_VEC2 },
];

class BoardServiceStub {
    placedLetters: { letter: string; position: Vec2 }[][] = [];

    placeLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse {
        this.placedLetters.push(letters);
        return { isSuccess: true, points: 0, description: '' };
    }
}

describe('PlaceAction', () => {
    let boardServiceStub: BoardServiceStub;
    let play: Play;
    let playerData: PlayerData;
    let placeAction: PlaceAction;

    beforeEach(() => {
        boardServiceStub = new BoardServiceStub();
        play = { score: 0, letters: LETTERS_PAIR };
        playerData = { score: 0, rack: LETTERS };

        placeAction = new PlaceAction(boardServiceStub as unknown as BoardService, play, playerData);
    });

    it('should return null', () => {
        expect(placeAction.execute()).toBeNull();
    });

    it('should place letters on board', () => {
        placeAction.execute();

        expect(boardServiceStub.placedLetters[0]).toEqual(play.letters);
    });

    it('should increase player score', () => {
        const NEW_SCORE = 10;
        play.score = NEW_SCORE;

        placeAction.execute();

        expect(playerData.score).toEqual(NEW_SCORE);
    });

    it('should remove letters from rack', () => {
        placeAction.execute();

        expect(playerData.rack.length).toEqual(0);
    });
});
