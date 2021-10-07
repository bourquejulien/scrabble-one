import { Injectable } from '@angular/core';
import { letterDefinitions } from '@common/letter';

@Injectable({
    providedIn: 'root',
})
export class ReserveService {
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
        }
    }

    drawLetter(): string {
        const randomLetterIndex = Math.floor(Math.random() * (this.reserve.length - 1));
        return this.reserve.splice(randomLetterIndex, 1)[0];
    }

    get length(): number {
        return this.reserve.length;
    }

    // For testing
    setReserve(mockReserve: string[]): void {
        this.reserve = [];

        for (const letter of mockReserve) {
            this.reserve.push(letter);
        }
    }

    reset(): void {
        this.reserve = [];
        for (const [letter, letterData] of letterDefinitions) {
            for (let i = 0; i < letterData.maxQuantity; i++) {
                this.reserve.push(letter);
            }
        }
    }
}
