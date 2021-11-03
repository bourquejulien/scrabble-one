import { PlayerData } from '@app/classes/player-data';
import { PlayerInfo } from '@app/classes/player-info';
import { Config } from '@app/config';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { LETTER_DEFINITIONS, PlayerStats } from '@common';
import { Observable, Subject } from 'rxjs';

export abstract class Player {
    isTurn: boolean;
    playerInfo: PlayerInfo;
    playerData: PlayerData;

    protected turnEnded: Subject<string>;
    protected boardHandler: BoardHandler;
    protected reserveHandler: ReserveHandler;
    protected socketHandler: SocketHandler;

    protected constructor() {
        this.playerData = { baseScore: 0, scoreAdjustment: 0, skippedTurns: 0, rack: [] };
        this.turnEnded = new Subject<string>();
    }

    init(boardHandler: BoardHandler, reserveHandler: ReserveHandler, socketHandler: SocketHandler): void {
        this.boardHandler = boardHandler;
        this.reserveHandler = reserveHandler;
        this.socketHandler = socketHandler;
    }

    fillRack(): void {
        while (this.reserveHandler.length > 0 && this.playerData.rack.length < Config.RACK_SIZE) {
            this.playerData.rack.push(this.reserveHandler.drawLetter());
        }
    }

    onTurn(): Observable<string> {
        return this.turnEnded.asObservable();
    }

    rackPoints(): number {
        let playerPoint = 0;
        for (const letter of this.playerData.rack) {
            const currentLetterData = LETTER_DEFINITIONS.get(letter.toLowerCase());
            playerPoint += currentLetterData?.points ?? 0;
        }

        return playerPoint;
    }

    get id(): string {
        return this.playerInfo.id;
    }

    get stats(): PlayerStats {
        const points = Math.max(0, this.playerData.baseScore + this.playerData.scoreAdjustment);
        return { points, rackSize: this.playerData.rack.length };
    }

    protected endTurn(): void {
        this.isTurn = false;
        this.turnEnded.next(this.playerInfo.id);
    }

    abstract startTurn(): Promise<void>;
}
