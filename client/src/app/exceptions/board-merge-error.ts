import { BoardError } from './board-error';

export class BoardMergeError extends BoardError {
    constructor(message: string) {
        super(message);
        this.name = 'BoardMergeError';
    }
}
