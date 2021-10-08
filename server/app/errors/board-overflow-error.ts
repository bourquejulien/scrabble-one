import { BoardError } from './board-error';

export class BoardOverflowError extends BoardError {
    constructor(message: string) {
        super(message);
        this.name = 'BoardOverflowError';
    }
}
