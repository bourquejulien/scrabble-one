import { Injectable } from '@angular/core';
import { VirtualPlayerLevel, VirtualPlayerName } from '@common';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environmentExt } from '@environment-ext';

const localUrl = (call: string, param: string) => `${environmentExt.apiUrl}admin/${call}/${param}`;

@Injectable({
    providedIn: 'root',
})
export class PlayerNameService {
    private readonly virtualPlayerNames: VirtualPlayerName[];
    private readonly virtualPlayerSubject: BehaviorSubject<VirtualPlayerName[]>;

    constructor(private httpClient: HttpClient) {
        this.virtualPlayerNames = [];
        this.virtualPlayerSubject = new BehaviorSubject<VirtualPlayerName[]>([]);

        this.retrievePlayerNames();
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

    get onVirtualPlayerUpdate(): Observable<VirtualPlayerName[]> {
        return this.virtualPlayerSubject.asObservable();
    }

    private virtualPlayerUpdate(virtualPlayerNames: VirtualPlayerName[]) {
        if (virtualPlayerNames.length === 0) {
            return;
        }

        this.virtualPlayerNames.push(...virtualPlayerNames);
        this.virtualPlayerSubject.next(virtualPlayerNames);
    }
}
