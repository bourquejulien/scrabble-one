import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionService } from '@app/services/session/session.service';
import { environmentExt } from '@environment-ext';

const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}reserve/${call}/${id}`;

@Injectable({
    providedIn: 'root',
})
export class ReserveService {
    private reserve: string[];

    constructor(private readonly httpClient: HttpClient, private readonly sessionService: SessionService) {
        this.reset();
    }

    async refresh(): Promise<void> {
        this.reserve = await this.httpClient.get<string[]>(localUrl('retrieve', this.sessionService.id)).toPromise();
    }

    reset(): void {
        this.reserve = [];
    }

    getLetterAndQuantity(letterToUpdate: string): string {
        const firstIndex = this.reserve.indexOf(letterToUpdate);
        const lastIndex = this.reserve.lastIndexOf(letterToUpdate);

        if (lastIndex && firstIndex === -1) {
            return `${letterToUpdate.toUpperCase()} : 0`;
        }

        const currentQuantity = lastIndex - firstIndex + 1;
        return `${letterToUpdate.toUpperCase()} : ${currentQuantity}`;
    }

    get length(): number {
        return this.reserve.length;
    }
}
