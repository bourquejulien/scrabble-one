import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class RackService {
    readonly rack: string[];

    constructor() {
        this.rack = ['a', 'a', 'c', 'a', 'e', '*', '*'];
    }

    swapLeft(position: number): number {
        return this.swap(position, -1);
    }

    swapRight(position: number): number {
        return this.swap(position, 1);
    }

    indexOf(letter: string, fromIndex?: number): number {
        fromIndex = fromIndex ?? 0;
        let index = this.rack.indexOf(letter, this.mod(fromIndex));

        if (index === -1) {
            index = this.rack.indexOf(letter);
        }

        return index;
    }

    mod(value: number): number {
        return ((value % this.size) + this.size) % this.size;
    }

    private swap(position: number, delta: number): number {
        if (this.size === 0) return 0;

        const newPosition = this.mod(position + delta);
        [this.rack[position], this.rack[newPosition]] = [this.rack[newPosition], this.rack[position]];
        return newPosition;
    }

    get size(): number {
        return this.rack.length;
    }
}
