import { PlayerInfo } from '@app/classes/player-info';
import { PlayerData } from '@app/classes/player-data';
import { BehaviorSubject } from 'rxjs';

export interface IPlayer {
    id: string;
    playerInfo: PlayerInfo;
    readonly playerData: PlayerData;
    readonly turnEnded: BehaviorSubject<string>;

    startTurn(): Promise<void>;
    endTurn(): void;
    fillRack(): void;
}
