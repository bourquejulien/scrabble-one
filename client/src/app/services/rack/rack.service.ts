import { Injectable } from '@angular/core';
import { environmentExt } from '@environmentExt';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '@app/services/session/session.service';

const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}player/${call}/${id}`;

@Injectable({
    providedIn: 'root',
})
export class RackService {
    readonly rack: string[];

    constructor(private readonly httpClient: HttpClient, private readonly sessionService: SessionService) {
        this.rack = [];
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

    async refresh(): Promise<void> {
        const rack = await this.httpClient.get<string[]>(localUrl('rack', this.sessionService.id)).toPromise();
        this.update(rack);
    }

    private update(rack: string[]): void {
        rack = rack.slice();

        for (let i = 0; i < rack.length - this.rack.length; ) {
            this.rack.push('');
        }

        for (let i = 0; i < this.rack.length; i++) {
            const position = rack.indexOf(this.rack[i]);
            if (position !== -1) {
                rack.splice(position, 1);
            } else {
                this.rack[i] = '';
            }
        }

        for (const letter of rack) {
            this.rack[this.rack.indexOf('')] = letter;
        }

        let emptyIndex = this.rack.indexOf('');
        while (emptyIndex !== -1) {
            this.rack.splice(emptyIndex, 1);
            emptyIndex = this.rack.indexOf('');
        }
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
