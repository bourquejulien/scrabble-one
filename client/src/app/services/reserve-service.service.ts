import { Injectable } from '@angular/core';
import { letters } from '@app/classes/letter';

@Injectable({
    providedIn: 'root',
})
export class ReserveServiceService {
    // Map storing the letter and its point value
    reserve: Map<string, number>;
    constructor() {
        for (const i of letters) {
            this.reserve.set(i.letter, i.points);
        }
    }

    addLetter(letterToAdd: string): void {
        let currentQuantity: number | undefined = this.reserve.get(letterToAdd);
        // TO DO: Error message if currentQuantity === MAX_QUANTITY, since it shouldn't even be possible.

        // Finding the letter corresponding to the letterToAdd in the letters array.
        const foundLetter = letters.find((letterToFind) => letterToFind.letter === letterToAdd);
        if (foundLetter === undefined || currentQuantity === undefined) {
            return;
        }

        if (currentQuantity < foundLetter.MAX_QUANTITY) {
            this.reserve.set(letterToAdd, ++currentQuantity);
        }
    }

    removeLetter(letterToRemove: string): void {
        let currentQuantity: number | undefined = this.reserve.get(letterToRemove);

        // TO DO: Error message if currentQuantity < 0, since it shouldn't even be possible.
        if (currentQuantity === undefined) {
            return;
        }

        if (currentQuantity > 0) {
            this.reserve.set(letterToRemove, --currentQuantity);
        }
    }
}
