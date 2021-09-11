export class BoardOverflowError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BoardOverflowError';
    }
}
