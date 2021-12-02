import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environmentExt } from '@environment-ext';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { Answer, DictionaryMetadata, VirtualPlayerLevel, VirtualPlayerName } from '@common';

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

    private readonly virtualPlayerNames: VirtualPlayerName[];
    private readonly updatedDictionaries: Set<string>;
    private readonly errorSubject: Subject<string>;
    private readonly virtualPlayerSubject: BehaviorSubject<VirtualPlayerName[]>;

    constructor(private httpClient: HttpClient) {
        this.dictionaries = [];
        this.updatedDictionaries = new Set<string>();
        this.virtualPlayerNames = [];
        this.virtualPlayerSubject = new BehaviorSubject<VirtualPlayerName[]>([]);
        this.errorSubject = new Subject<string>();

        this.retrievePlayerNames();
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

    async retrievePlayerNames(): Promise<void> {
        const names = await this.httpClient.get<VirtualPlayerName[]>(localUrl('playername', '')).toPromise();
        this.virtualPlayerUpdate(names);
    }

    addPlayerName(name: string, level: VirtualPlayerLevel): void {
        this.httpClient.post<VirtualPlayerName[]>(localUrl('playername/set', level), { name }).subscribe((p) => this.virtualPlayerUpdate(p));
    }

    updatePlayerName(oldName: string, newName: string): void {
        this.httpClient.post<VirtualPlayerName[]>(localUrl('playername', 'rename'), [oldName, newName]).subscribe((p) => this.virtualPlayerUpdate(p));
    }

    removePlayerName(playerName: string): void {
        this.httpClient.delete<VirtualPlayerName[]>(localUrl('playername', playerName)).subscribe((p) => this.virtualPlayerUpdate(p));
    }

    virtualPlayerNamesByLevel(level: VirtualPlayerLevel): string[] {
        return this.virtualPlayerNames.filter((playerName) => playerName.level === level).map((playerName) => playerName.name);
    }

    async resetSettings(): Promise<void> {
        await this.httpClient.get<string[]>(localUrl('reset', '')).toPromise();
    }

    get onVirtualPlayerUpdate(): Observable<VirtualPlayerName[]> {
        return this.virtualPlayerSubject.asObservable();
    }

    get onerror(): Observable<string> {
        return this.errorSubject.asObservable();
    }

    get defaultDictionary(): DictionaryMetadata | null {
        return this.dictionaries.find((d) => d._id === DEFAULT_DICTIONARY) ?? null;
    }

    private virtualPlayerUpdate(virtualPlayerNames: VirtualPlayerName[]) {
        if (virtualPlayerNames.length === 0) {
            return;
        }
        this.virtualPlayerNames.push(...virtualPlayerNames);
        this.virtualPlayerSubject.next(virtualPlayerNames);
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
