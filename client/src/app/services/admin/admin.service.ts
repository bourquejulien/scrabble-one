import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environmentExt } from '@environment-ext';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DictionaryMetadata } from '@common';

const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}admin/${call}/${id}`;
interface Playernames {
    experts: string[];
    beginners: string[];
}
@Injectable({
    providedIn: 'root',
})
export class AdminService {
    dictionaries: DictionaryMetadata[];
    fileName = '';
    uploadSub: Subscription;
    uploadProgress: number;
    virtualPlayerNames: Playernames;

    constructor(private httpClient: HttpClient) {
        this.dictionaries = [];
        this.virtualPlayerNames = { experts: [], beginners: [] };
        this.retrieveUsernames();
        this.retrieveDictionnaries();
    }

    uploadFile(file: File) {
        const formData = new FormData();
        this.fileName = file.name;
        formData.append('file', file);
        const upload$ = this.httpClient
            .post(localUrl('dictionary', 'upload'), formData, {
                reportProgress: true,
                observe: 'events',
            })
            .pipe(finalize(() => this.finishUpload()));

        this.uploadSub = upload$.subscribe((uploadEvent) => {
            if (uploadEvent.type === HttpEventType.UploadProgress) {
                const progressMax = 100;
                const total = uploadEvent.total ?? progressMax;
                this.uploadProgress = Math.round(progressMax * (uploadEvent.loaded / total));
            }
        });
    }

    finishUpload() {
        this.uploadSub.unsubscribe();
        this.uploadProgress = 0;
        this.retrieveDictionnaries();
    }

    async retrieveDictionnaries() {
        this.dictionaries = await this.httpClient.get<DictionaryMetadata[]>(localUrl('dictionary', '')).toPromise();
    }

    removeDictionary(metadata: DictionaryMetadata) {
        this.dictionaries.splice(this.dictionaries.indexOf(metadata), 1);
    }

    async updateDictionaries() {
        await this.httpClient.post(localUrl('dictionary', ''), this.dictionaries).toPromise();
    }

    downloadDictionary(id: string) {
        return this.httpClient.get<Blob>(localUrl('dictionary', id));
    }

    async retrieveUsernames() {
        const result = await this.httpClient.get<Playernames>(localUrl('playername', '')).toPromise();
        if (result) {
            this.virtualPlayerNames = result;
        }
    }

    async updateUsername() {
        await this.httpClient.post<Playernames>(localUrl('playername', ''), this.virtualPlayerNames).toPromise();
    }

    removePlayername(playername: string, expert: boolean) {
        if (expert) {
            this.virtualPlayerNames.experts.splice(this.virtualPlayerNames.experts.indexOf(playername), 1);
        } else {
            this.virtualPlayerNames.beginners.splice(this.virtualPlayerNames.beginners.indexOf(playername), 1);
        }
    }

    async resetSettings(): Promise<void> {
        await this.httpClient.get<string[]>(localUrl('reset', '')).toPromise();
    }
}
