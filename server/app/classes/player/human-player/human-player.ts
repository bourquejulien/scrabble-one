import { IPlayer } from '@app/classes/player/player';
import { PlayerInfo } from '@app/classes/player-info';

export class HumanPlayer implements IPlayer {
    id: string;
    isVirtual: boolean;
    playerInfo: PlayerInfo;
}
