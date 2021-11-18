import { PlayerInfo } from '@app/classes/player-info';
import { Config } from '@app/config';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { LETTER_DEFINITIONS, PlayerStats } from '@common';
import { Observable, Subject } from 'rxjs';
import { PlayerStatsHandler } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-handler';

export abstract class Player {
    isTurn: boolean;
    rack: string[];

    protected turnEnded: Subject<string>;
    protected boardHandler: BoardHandler;
    protected reserveHandler: ReserveHandler;
    protected socketHandler: SocketHandler;
    protected statsHandler: PlayerStatsHandler;

    protected constructor(public playerInfo: PlayerInfo) {
        this.rack = [];
        this.turnEnded = new Subject<string>();
    }

    init(boardHandler: BoardHandler, reserveHandler: ReserveHandler, socketHandler: SocketHandler, playerStatsHandler: PlayerStatsHandler): void {
        this.boardHandler = boardHandler;
        this.reserveHandler = reserveHandler;
        this.socketHandler = socketHandler;
        this.statsHandler = playerStatsHandler;
    }

    fillRack(): void {
        while (this.reserveHandler.length > 0 && this.rack.length < Config.RACK_SIZE) {
            this.rack.push(this.reserveHandler.drawLetter());
        }
    }

    onTurn(): Observable<string> {
        return this.turnEnded.asObservable();
    }

    rackPoints(): number {
        let playerPoint = 0;
        for (const letter of this.rack) {
            const currentLetterData = LETTER_DEFINITIONS.get(letter.toLowerCase());
            playerPoint += currentLetterData?.points ?? 0;
        }

        return playerPoint;
    }

    get id(): string {
        return this.playerInfo.id;
    }

    get stats(): PlayerStats {
        const points = this.statsHandler.points;
        return { points, rackSize: this.rack.length };
    }

    protected endTurn(): void {
        this.isTurn = false;
        this.turnEnded.next(this.playerInfo.id);
    }

    abstract startTurn(): Promise<void>;
}
