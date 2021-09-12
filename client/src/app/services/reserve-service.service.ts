import { Injectable } from '@angular/core';
import { LetterInterface, letters } from '@app/classes/letter';

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

    /**
      Adds letter from reserve.
      @param letterToAdd letter to find and add in reserve.
      @returns true if added to reserve succesfully, and false if not.
     */
    addLetter(letterToAdd: string): boolean {
        let currentQuantity: number | undefined = this.reserve.get(letterToAdd);
        // TO DO: Error message if currentQuantity === MAX_QUANTITY, since it shouldn't even be possible.

        // Finding the letter corresponding to the letterToAdd in the letters array.
        const foundLetter = letters.find((letterToFind) => letterToFind.letter === letterToAdd);
        if (foundLetter === undefined || currentQuantity === undefined) {
            return false;
        }

        if (currentQuantity < foundLetter.MAX_QUANTITY) {
            this.reserve.set(letterToAdd, ++currentQuantity);
            return true;
        }
        return false;
    }

    /**
      Removes letter from reserve.
     *
      @param letterToRemove letter to find and remove from reserve.
      @returns true if removed from reserve succesfully, and false if not.
     */
    removeLetter(letterToRemove: string): boolean {
        let currentQuantity: number | undefined = this.reserve.get(letterToRemove);

        // TO DO: Error message if currentQuantity < 0, since it shouldn't even be possible. For debuggin purposes.
        if (currentQuantity === undefined) {
            return false;
        }

        if (currentQuantity > 0) {
            this.reserve.set(letterToRemove, --currentQuantity);
            return true;
        }
        return false;
    }

    // Ask if while will block something related to server.
    // FIGURE OUT WHAT CHEVALET WILL BE (property, global var, etc)
    /**
      Chooses seven random letter from reserve to give to the player. 
      @param rack array storing the palyer's letters
      @returns void
     */
    attributeRandomLetters(rack: LetterInterface[]): void {
        for (let i = 0; i < rack.length; i++) {
            let randomLetterIndex;
            do {
                // Ask if there is a better way to randomize a number
                randomLetterIndex = Math.floor(Math.random() * (letters.length + 1));
            } while (this.removeLetter(letters[randomLetterIndex].letter) !== true);

            // add letters to rack
            rack.push(letters[randomLetterIndex]);
        }
    }
}
