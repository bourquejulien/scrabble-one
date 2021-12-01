import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environmentExt } from '@environment-ext';
import { Observable, Subject, Subscription } from 'rxjs';
import { Answer, DictionaryMetadata } from '@common';

const localUrl = (call: string, id: string) => `${environmentExt.apiUrl}admin/${call}/${id}`;

const DEFAULT_DICTIONARY = 'dictionary.json';
const ERROR_LEVEL = 400;

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    dictionaries: DictionaryMetadata[];
    fileName = '';
    uploadProgress: number;

    private uploadSub: Subscription;

    private readonly updatedDictionaries: Set<string>;
    private readonly errorSubject: Subject<string>;

    constructor(private httpClient: HttpClient) {
        this.dictionaries = [];
        this.updatedDictionaries = new Set<string>();
        this.errorSubject = new Subject<string>();

        this.retrieveDictionaries();
    }

    uploadFile(file: File): void {
        const formData = new FormData();
        this.fileName = file.name;
        formData.append('file', file);

        const upload$ = this.httpClient.post<Answer<DictionaryMetadata[], string>>(localUrl('dictionary', 'upload'), formData, {
            reportProgress: true,
            observe: 'events',
        });

        this.uploadSub = upload$.subscribe(
            (uploadEvent) => {
                if (uploadEvent.type === HttpEventType.UploadProgress) {
                    const progressMax = 100;
                    const total = uploadEvent.total ?? progressMax;
                    this.uploadProgress = Math.round(progressMax * (uploadEvent.loaded / total));
                } else if (uploadEvent.type === HttpEventType.Response) {
                    this.finishUpload(uploadEvent.body);
                }
            },
            (err: HttpErrorResponse) => {
                if (err.status >= ERROR_LEVEL) {
                    this.finishUpload();
                }
            },
        );
    }

    async retrieveDictionaries(): Promise<void> {
        this.dictionaries = await this.httpClient.get<DictionaryMetadata[]>(localUrl('dictionary', '')).toPromise();
    }

    removeDictionary(metadata: DictionaryMetadata): void {
        this.httpClient
            .delete(localUrl('dictionary', metadata._id))
            .subscribe(() => this.dictionaries.splice(this.dictionaries.indexOf(metadata), 1));
    }

    async updateDictionaries(): Promise<void> {
        const updatedMetadata = this.dictionaries.filter((d) => this.updatedDictionaries.has(d._id));
        const answer = await this.httpClient.post<Answer<DictionaryMetadata[]>>(localUrl('dictionary', 'update'), updatedMetadata).toPromise();
        this.updatedDictionaries.clear();
        this.dictionaries = answer.payload;

        if (!answer.isSuccess) {
            this.errorSubject.next('Erreur lors de la mise à jours des dictionnaires');
        }
    }

    dictionaryUpdated(dictionary: DictionaryMetadata): void {
        this.updatedDictionaries.add(dictionary._id);
    }

    downloadDictionary(id: string): Observable<Blob> {
        return this.httpClient.get<Blob>(localUrl('dictionary', id));
    }

    isDefaultDictionary(metadata: DictionaryMetadata): boolean {
        return metadata._id === DEFAULT_DICTIONARY;
    }

    async resetSettings(): Promise<void> {
        await this.httpClient.get<string[]>(localUrl('reset', '')).toPromise();
    }

    get onerror(): Observable<string> {
        return this.errorSubject.asObservable();
    }

    get defaultDictionary(): DictionaryMetadata | null {
        return this.dictionaries.find((d) => d._id === DEFAULT_DICTIONARY) ?? null;
    }

    private finishUpload(answer: Answer<DictionaryMetadata[], string> | null = null): void {
        this.uploadSub.unsubscribe();
        this.uploadProgress = 0;

        if (answer == null || !answer.isSuccess) {
            this.errorSubject.next(answer?.payload ?? 'Erreur lors du téléversement du dictionnaire');
            return;
        }

        this.dictionaries = answer.payload;
    }
}
