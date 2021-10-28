import { PlayerInfo } from '@app/classes/player-info';
import { PlayerData } from '@app/classes/player-data';
import { Observable } from 'rxjs';

export interface Player {
    isTurn: boolean;
    readonly id: string;
    readonly playerInfo: PlayerInfo;
    readonly playerData: PlayerData;

    startTurn(): Promise<void>;
    fillRack(): void;
    onTurn(): Observable<string>;
}
