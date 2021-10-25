import { Injectable } from '@angular/core';
import { environment } from '@environment';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '@app/services/session/session.service';

const localUrl = (call: string, id: string) => `${environment.serverUrl}api/reserve/${call}/${id}`;

@Injectable({
    providedIn: 'root',
})
export class ReserveService {
    private reserve: string[];

    constructor(private readonly httpClient: HttpClient, private readonly sessionService: SessionService) {
        this.reserve = [];
    }

    async refresh(): Promise<boolean> {
        const response = await this.httpClient.get(localUrl('retrieve', this.sessionService.id)).toPromise();

        try {
            this.reserve = response as string[];
        } catch (e) {
            return false;
        }

        return true;
    }

    getLetterAndQuantity(letterToUpdate: string): string {
        const firstIndex = this.reserve.indexOf(letterToUpdate);
        const lastIndex = this.reserve.lastIndexOf(letterToUpdate);
        const currentQuantity = lastIndex - firstIndex + 1;
        return `${letterToUpdate.toUpperCase()} : ${currentQuantity}`;
    }

    get length(): number {
        return this.reserve.length;
    }
}
