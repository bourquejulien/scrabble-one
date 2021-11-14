import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environmentExt } from '@environment-ext';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DictionaryMetadata } from '@common';

const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}admin/${call}/${id}`;

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    dictionaries: DictionaryMetadata[];
    fileName = '';
    uploadSub: Subscription;
    uploadProgress: number;
    private virtualPlayerNames: Map<string, boolean>;

    constructor(private httpClient: HttpClient) {
        this.virtualPlayerNames = new Map();
        this.retrieveDictionnaries();
        this.retrieveUsernames();
    }

    uploadFile(file: File) {
        const formData = new FormData();
        this.fileName = file.name;
        formData.append('dictionary', file);
        const upload$ = this.httpClient
            .post(localUrl('upload', ''), formData, {
                reportProgress: true,
                observe: 'events',
            })
            .pipe(finalize(() => this.finishUpload()));

        this.uploadSub = upload$.subscribe((uploadEvent) => {
            if (uploadEvent.type === HttpEventType.UploadProgress) {
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                this.uploadProgress = Math.round(100 * uploadEvent.loaded);
            }
        });
    }

    finishUpload() {
        this.uploadSub.unsubscribe();
        this.uploadProgress = 0;
    }

    async retrieveDictionnaries() {
        this.dictionaries = await this.httpClient.get<DictionaryMetadata[]>(localUrl('dictionary', '')).toPromise();
    }

    async retrieveUsernames() {
        this.virtualPlayerNames = await this.httpClient.get<Map<string, boolean>>(localUrl('playername', '')).toPromise();
    }

    async resetSettings(): Promise<void> {
        await this.httpClient.get<string[]>(localUrl('reset', '')).toPromise();
    }

    async removeDictionary(id: string): Promise<void> {
        await this.httpClient.delete(localUrl('dictionary', id)).toPromise();
    }

    async downloadDictionary(id: string) {
        await this.httpClient.get(localUrl('dictionary', id)).toPromise();
    }

    getPlayerNames(isExpert: boolean): string[] {
        const names: string[] = [];
        this.virtualPlayerNames.forEach((value, key) => {
            if (value === isExpert) {
                names.push(key);
            }
        });
        return names;
    }
}
