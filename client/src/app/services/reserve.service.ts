import { Injectable } from '@angular/core';
import { letterDefinitions } from '@app/classes/letter';

@Injectable({
    providedIn: 'root',
})
export class ReserveService {
    private reserve: string[] = [];

    constructor() {
        for (const [letter, letterData] of letterDefinitions) {
            for (let i = 0; i < letterData.maxQuantity; i++) {
                this.reserve.push(letter);
            }
        }
    }

    putBackLetter(letterToExchange: string): void {
        const letterIndex = this.reserve.indexOf(letterToExchange);
        this.reserve.splice(letterIndex, 0, letterToExchange);
    }

    drawLetter(): number {
        const randomLetterIndex = Math.floor(Math.random() * this.reserve.length);
        this.reserve.splice(randomLetterIndex, 1);

        return randomLetterIndex;
    }
}
