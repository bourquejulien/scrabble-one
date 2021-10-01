/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */

import { Direction } from '@app/classes/board/direction';
import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
    providedIn: 'root',
})
export class FakePlayerService {
    rack: string[] = [];
    rackUpdated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    constructor() {}

    checkIfLettersInRack(lettersToPlace: string): string {
        return '';
    }

    completeTurn(): void {}

    placeLetters(word: string, position: Vec2, direction: Direction): string {
        return 'a';
    }

    setRack(mockRack: string[]): void {}

    exchangeLetters(lettersToExchange: string): string {
        return '';
    }

    updateReserve(lettersToPlace: string): string {
        return '';
    }

    updateRack(lettersToPlace: string): void {}

    get length(): number {
        return 0;
    }
}
