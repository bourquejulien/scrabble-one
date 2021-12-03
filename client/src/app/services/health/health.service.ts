import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment';

const LOCAL_URL = `${environment.serverUrl}status`;

@Injectable({
    providedIn: 'root',
})
export class HealthService {
    constructor(private readonly httpClient: HttpClient) {}

    async isServerOk(): Promise<void> {
        await this.httpClient.get(LOCAL_URL, { responseType: 'text' }).toPromise();
    }
}
