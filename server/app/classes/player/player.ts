import { PlayerInfo } from '@app/classes/player-info';

export interface IPlayer {
    id: string;
    isVirtual: boolean;
    playerInfo: PlayerInfo;
}
