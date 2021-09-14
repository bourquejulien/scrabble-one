import { Injectable } from '@angular/core';
import { letterDefinitions } from '@app/classes/letter';

@Injectable({
    providedIn: 'root',
})

export class ReserveService {
    private reserve: string[];

    constructor() {
        for (const element of letterDefinitions) {
            for (let i = 0; i < element[1].maxQuantity; i++) {
                this.reserve.push(element[0]);
            }
        }
    }

    putBackLetter(letterToExchange: string): void {
        const letterIndex = this.reserve.indexOf(letterToExchange);
        this.reserve.splice(letterIndex, 0, letterToExchange);
    }

    drawLetter(): string {
        const randomLetterIndex = Math.floor(Math.random() * (this.reserve.length));
        this.reserve.splice(randomLetterIndex, 1);

        return this.reserve[randomLetterIndex];
    }

    getLength(): number {
        return this.reserve.length;
    }
}
