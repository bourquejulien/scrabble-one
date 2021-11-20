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
        const currentBestScores = await this.httpClient.get<Score[]>(localUrl(collectionName)).toPromise();

        for (const score of currentBestScores) {
            const firstName = score.name[0];

            if (firstName === '') {
                score.name.splice(0, 1);
            }
        }
        return currentBestScores;
    }
}
