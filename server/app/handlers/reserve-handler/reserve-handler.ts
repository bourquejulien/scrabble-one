import { LETTER_DEFINITIONS } from '@common';

export class ReserveHandler {
    reserve: string[] = [];

    constructor() {
        this.reserve = [];

        for (const [letter, letterData] of LETTER_DEFINITIONS) {
            for (let i = 0; i < letterData.maxQuantity; i++) {
                this.reserve.push(letter);
            }
        }
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

    get length(): number {
        return this.reserve.length;
    }
}
