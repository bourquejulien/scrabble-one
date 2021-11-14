import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environmentExt } from '@environment-ext';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DictionaryMetadata } from '@common';

const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}admin/${call}/${id}`;
interface Playername {
    name: string;
    expert: boolean;
}
@Injectable({
    providedIn: 'root',
})
export class AdminService {
    dictionaries: DictionaryMetadata[];
    fileName = '';
    uploadSub: Subscription;
    uploadProgress: number;
    virtualPlayerNames: Playername[];

    constructor(private httpClient: HttpClient) {
        this.retrieveUsernames();
        this.retrieveDictionnaries();
    }

    uploadFile(file: File) {
        const formData = new FormData();
        this.fileName = file.name;
        formData.append('dictionary', file);
        const upload$ = this.httpClient
            .post(localUrl('dictionary', 'upload'), formData, {
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
        const result = await this.httpClient.get<Playername[]>(localUrl('playername', '')).toPromise();
        if (result) {
            this.virtualPlayerNames = result;
        }
    }

    async updateUsername() {
        await this.httpClient.post<Playername[]>(localUrl('playername', ''), this.virtualPlayerNames).toPromise();
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

    removePlayername(playername: Playername) {
        this.virtualPlayerNames.splice(this.virtualPlayerNames.indexOf(playername), 1);
    }
}
