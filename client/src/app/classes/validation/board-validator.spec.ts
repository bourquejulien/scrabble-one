import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Board } from '@app/classes/board/board';
import { BoardValidator } from './board-validator';
import { Constants } from '@app/constants/global.constants';

describe('BoardValidator', () => {
    let board: Board;
    let boardValidator: BoardValidator;

    beforeEach(() => {
        board = new Board(Constants.GRID.GRID_SIZE);
        boardValidator = new BoardValidator(board, );
    });

    it('should be created', () => {
        expect(boardValidator).toBeTruthy();
    });

    it('createCanvas should create a HTMLCanvasElement with good dimensions', () => {
        const width = 15;
        const height = 25;
        // eslint-disable-next-line -- createCanvas is private and we need access for the test
        const canvas = CanvasTestHelper.createCanvas(width, height);
        expect(canvas).toBeInstanceOf(HTMLCanvasElement);
        expect(canvas.width).toBe(width);
        expect(canvas.height).toBe(height);
    });
});
