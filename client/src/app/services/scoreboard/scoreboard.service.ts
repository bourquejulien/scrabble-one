import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Score } from '@common';
import { environmentExt } from '@environment-ext';


const localUrl = (call: string) => `${environmentExt.apiUrl}score/${call}`;

@Injectable({
    providedIn: 'root'
})
export class ScoreboardService {

    constructor(private readonly httpClient: HttpClient) {}

    async displayScores(collectionName: string): Promise<Score[]> {
        let currentBestScores = await this.httpClient.get<Score[]>(localUrl(collectionName)).toPromise();

        for (let i = 0; i < currentBestScores.length; i++) {
            const firstName = currentBestScores[i].name[0];

            if (firstName === '') {
                currentBestScores[i].name.splice(0, 1);
            }
        }
        return currentBestScores;
    }
}
