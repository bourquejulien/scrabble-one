import { letterDefinitions } from '@common';

export class ReserveHandler {
    private reserve: string[] = [];

    constructor() {
        this.reset();
    }

    putBackLetter(letterToExchange: string): void {
        const letterIndex = this.reserve.indexOf(letterToExchange);
        if (letterIndex !== -1) {
            this.reserve.splice(letterIndex, 0, letterToExchange);
        } else if (letterToExchange.match(/^[a-z]$/) || letterToExchange === '*') {
            this.reserve.push(letterToExchange);
            this.reserve.sort();
        }
    }

    drawLetter(): string {
        const randomLetterIndex = Math.floor(Math.random() * (this.reserve.length - 1));
        return this.reserve.splice(randomLetterIndex, 1)[0];
    }

    getLetterAndQuantity(letterToUpdate: string): string {
        const firstIndex = this.reserve.indexOf(letterToUpdate);
        const lastIndex = this.reserve.lastIndexOf(letterToUpdate);
        const currentQuantity = lastIndex - firstIndex + 1;
        return `${letterToUpdate.toUpperCase()} : ${currentQuantity}`;
    }

    reset(): void {
        this.reserve = [];
        for (const [letter, letterData] of letterDefinitions) {
            for (let i = 0; i < letterData.maxQuantity; i++) {
                this.reserve.push(letter);
            }
        }
    }

    get length(): number {
        return this.reserve.length;
    }
}
