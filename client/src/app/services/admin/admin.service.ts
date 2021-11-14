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
        this.virtualPlayerNames = new Map<string, boolean>();
        this.retrieveUsernames();
        this.retrieveDictionnaries();
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
        const result = await this.httpClient.get<Map<string, boolean>>(localUrl('playername', '')).toPromise();
        if (result) {
            this.virtualPlayerNames = result;
        }
    }

    async resetSettings(): Promise<void> {
        await this.httpClient.get<string[]>(localUrl('reset', '')).toPromise();
    }

    async removeDictionary(id: string): Promise<void> {
        await this.httpClient.delete(localUrl('dictionary', id)).toPromise();
    }

    downloadDictionary(id: string) {
        return this.httpClient.get<Blob>(localUrl('dictionary', id));
    }

    getPlayerNames(isExpert: boolean): string[] {
        const names: string[] = [];
        if (this.virtualPlayerNames.size === 0) return [];
        this.virtualPlayerNames.forEach((value, key) => {
            if (value === isExpert) {
                names.push(key);
            }
        });
        return names;
    }
}
