import { PlayerInfo } from '@app/classes/player-info';
import { PlayerData } from '@app/classes/player-data';
import { Observable } from 'rxjs';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';

export interface Player {
    isTurn: boolean;
    id: string;
    playerInfo: PlayerInfo;
    playerData: PlayerData;
    init(boardHandler: BoardHandler, reserveHandler: ReserveHandler, socketHandler: SocketHandler): void;
    fillRack(): void;
    startTurn(): Promise<void>;
    onTurn(): Observable<string>;
}
