import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Score } from '@common';
import { environmentExt } from '@environment-ext';

const localUrl = (call: string) => `${environmentExt.apiUrl}score/${call}`;

@Injectable({
    providedIn: 'root',
})
export class ScoreboardService {
    constructor(private readonly httpClient: HttpClient) {}

    async displayScores(collectionName: string): Promise<Score[]> {
        return await this.httpClient.get<Score[]>(localUrl(collectionName)).toPromise();
    }
}
