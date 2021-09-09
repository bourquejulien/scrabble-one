import { Injectable } from '@angular/core';
import { letters } from '@app/classes/letter';

@Injectable({
  providedIn: 'root'
})
export class ReserveServiceService {
  reserve: Map<string, number>;
  constructor() {
    // TO DO: Initialize entire hashmap from letters array.
  }

  addLetter(letterToAdd: string): void {
    let currentQuantity: number | undefined = this.reserve.get(letterToAdd);
    // From letterToAdd passed as parameter, find corresponding letter in the letters array and assign it to the letter property.
    const letter = letters.find(letter => letter.letter === letterToAdd);
    if (letter === undefined || currentQuantity === undefined) {
      return;
    }

    if (currentQuantity < letter.MAX_QUANTITY) {
      this.reserve.set(letterToAdd, ++currentQuantity);
    }
  }

  removeLetter(letterToRemove: string): void {
    let currentQuantity: number | undefined = this.reserve.get(letterToRemove);

    if (currentQuantity === undefined) {
      return;
    }

    if (currentQuantity > 0) {
      this.reserve.set(letterToRemove, --currentQuantity);
    }
  }
}