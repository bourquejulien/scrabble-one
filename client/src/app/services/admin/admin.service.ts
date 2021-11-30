import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environmentExt } from '@environment-ext';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Answer, DictionaryMetadata, VirtualPlayerLevel } from '@common';

const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}admin/${call}/${id}`;
interface Playernames {
    experts: string[];
    beginners: string[];
}

const DEFAULT_DICTIONARY = 'dictionary.json';

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    // TODO Just to trigger the pipeline
    dictionaries: DictionaryMetadata[];
    fileName = '';
    uploadSub: Subscription;
    uploadProgress: number;
    virtualPlayerNames: Playernames;

    private readonly updatedDictionaries: Set<string>;

    constructor(private httpClient: HttpClient) {
        this.dictionaries = [];
        this.updatedDictionaries = new Set<string>();
        this.virtualPlayerNames = { experts: [], beginners: [] };

        this.retrieveUsernames();
        this.retrieveDictionaries();
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
        this.retrieveDictionaries();
    }

    async retrieveDictionaries() {
        this.dictionaries = await this.httpClient.get<DictionaryMetadata[]>(localUrl('dictionary', '')).toPromise();
    }

    removeDictionary(metadata: DictionaryMetadata) {
        this.httpClient
            .delete(localUrl('dictionary', metadata._id))
            .subscribe(() => this.dictionaries.splice(this.dictionaries.indexOf(metadata), 1));
    }

    async updateDictionaries() {
        const updatedMetadata = this.dictionaries.filter((d) => this.updatedDictionaries.has(d._id));
        const answer = await this.httpClient.post<Answer<DictionaryMetadata[]>>(localUrl('dictionary', 'update'), updatedMetadata).toPromise();
        this.dictionaries = answer.payload;
    }

    dictionaryUpdated(dictionary: DictionaryMetadata): void {
        this.updatedDictionaries.add(dictionary._id);
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

    isDefaultDictionary(metadata: DictionaryMetadata) {
        return metadata._id === 'dictionary.json';
    }

    async resetSettings(): Promise<void> {
        await this.httpClient.get<string[]>(localUrl('reset', '')).toPromise();
    }

    getVirtualPlayerNamesByLevel(virtualPlayerLevel: VirtualPlayerLevel) {
        return (virtualPlayerLevel === VirtualPlayerLevel.Easy ? this.virtualPlayerNames.beginners : this.virtualPlayerNames.experts).slice();
    }

    get defaultDictionary(): DictionaryMetadata | null {
        return this.dictionaries.find((d) => d._id === DEFAULT_DICTIONARY) ?? null;
    }
}
