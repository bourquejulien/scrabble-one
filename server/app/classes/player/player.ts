import { PlayerInfo } from '@app/classes/player-info';
import { Config } from '@app/config';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { Observable, Subject } from 'rxjs';
import { SessionStatsHandler } from '@app/handlers/stats-handlers/session-stats-handler/session-stats-handler';
import { PlayerStatsNotifier } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-notifier';

export abstract class Player {
    isTurn: boolean;
    rack: string[];

    protected turnEnded: Subject<string>;
    protected boardHandler: BoardHandler;
    protected reserveHandler: ReserveHandler;
    protected socketHandler: SocketHandler;
    protected statsNotifier: PlayerStatsNotifier;

    protected constructor(public playerInfo: PlayerInfo) {
        this.rack = [];
        this.turnEnded = new Subject<string>();
    }

    init(boardHandler: BoardHandler, reserveHandler: ReserveHandler, socketHandler: SocketHandler, gameStatsHandler: SessionStatsHandler): void {
        this.boardHandler = boardHandler;
        this.reserveHandler = reserveHandler;
        this.socketHandler = socketHandler;
        this.statsNotifier = gameStatsHandler.getPlayerStatsHandler(this.id);
    }

    fillRack(): void {
        while (this.reserveHandler.length > 0 && this.rack.length < Config.RACK_SIZE) {
            this.rack.push(this.reserveHandler.drawLetter());
        }
        this.statsNotifier.notifyRackUpdate(this.rack);
    }

    onTurn(): Observable<string> {
        return this.turnEnded.asObservable();
    }

    get id(): string {
        return this.playerInfo.id;
    }

    protected endTurn(): void {
        this.isTurn = false;
        this.turnEnded.next(this.playerInfo.id);
    }

    abstract startTurn(): Promise<void>;
}
