import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class RackService {
    readonly rack: string[];

    constructor() {
        this.rack = ['a', 'b', 'c', 'd', 'd', '*', '*'];
    }

    swapLeft(position: number): number {
        if (position > 0) {
            return this.swap(position, -1);
        } else {
            const exchange = this.rack.splice(0, 1);
            return this.rack.push(exchange[0]) - 1;
        }
    }

    swapRight(position: number): number {
        if (position < this.length - 1) {
            return this.swap(position, 1);
        } else {
            const exchange = this.rack.splice(0, this.length - 1);
            this.rack.push(...exchange);
            return 0;
        }
    }

    indexOf(letter: string, fromIndex?: number): number {
        fromIndex = fromIndex ?? 0;
        let index = this.rack.indexOf(letter, this.mod(fromIndex));

        if (index === -1) {
            index = this.rack.indexOf(letter);
        }

        return index;
    }

    empty() {
        this.rack.length = 0;
    }

    mod(value: number): number {
        return ((value % this.length) + this.length) % this.length;
    }

    private swap(position: number, delta: number): number {
        if (this.length === 0) return -1;

        const newPosition = this.mod(position + delta);
        [this.rack[position], this.rack[newPosition]] = [this.rack[newPosition], this.rack[position]];
        return newPosition;
    }

    get length(): number {
        return this.rack.length;
    }
}
