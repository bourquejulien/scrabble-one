import { Injectable } from '@angular/core';
import { PlayerData } from '@app/classes/player-data';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { BoardService } from '@app/services/board/board.service';

// TODO To remove once the server is master over the client
// DO NOT TEST!!
@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerService {
    playerData: PlayerData;

    constructor(private readonly reserveService: ReserveService, private readonly boardService: BoardService) {
        this.playerData = { score: 0, skippedTurns: 0, rack: [] };
    }

    // TODO To remove once the server is master over the client
    // DO NOT TEST!!
    async refresh() {
        await this.reserveService.refresh();
        await this.boardService.refresh();
    }

    reset(): void {
        this.playerData = { score: 0, skippedTurns: 0, rack: [] };
    }
}
