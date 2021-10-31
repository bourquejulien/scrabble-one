import { Injectable } from '@angular/core';
import { PlayerData } from '@app/classes/player-data';

// TODO To remove once the server is master over the client
// DO NOT TEST!!
@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerService {
    playerData: PlayerData;

    constructor() {
        this.playerData = { score: 0, skippedTurns: 0, rack: [] };
    }

    reset(): void {
        this.playerData = { score: 0, skippedTurns: 0, rack: [] };
    }
}
