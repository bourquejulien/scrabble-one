import { PlayerInfo } from '@app/classes/player-info';
import { PlayerData } from '@app/classes/player-data';
import { Observable, Subject } from 'rxjs';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { letterDefinitions, PlayerStats } from '@common';

export abstract class Player {
    isTurn: boolean;
    readonly playerInfo: PlayerInfo;
    readonly playerData: PlayerData;

    protected readonly turnEnded: Subject<string>;

    protected constructor() {
        this.playerData = { baseScore: 0, scoreAdjustment: 0, skippedTurns: 0, rack: [] };
        this.turnEnded = new Subject<string>();
    }

    onTurn(): Observable<string> {
        return this.turnEnded.asObservable();
    }

    playerRackPoints(): number {
        let playerPoint = 0;
        for (const letter of this.playerData.rack) {
            const currentLetterData = letterDefinitions.get(letter.toLowerCase());
            if (currentLetterData?.points === undefined) return -1;
            playerPoint += currentLetterData.points;
        }
        return playerPoint;
    }

    get id(): string {
        return this.playerInfo.id;
    }

    get stats(): PlayerStats {
        return { points: this.playerData.baseScore + this.playerData.scoreAdjustment, rackSize: this.playerData.rack.length };
    }

    protected endTurn(): void {
        this.isTurn = false;
        this.turnEnded.next(this.playerInfo.id);
    }

    abstract init(boardHandler: BoardHandler, reserveHandler: ReserveHandler, socketHandler: SocketHandler): void;
    abstract fillRack(): void;
    abstract startTurn(): Promise<void>;
}
