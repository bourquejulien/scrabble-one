import { IPlayer } from '@app/classes/player/player';
import { PlayerInfo } from '@app/classes/player-info';
import { PlayerData } from '@app/classes/player-data';
import { BehaviorSubject } from 'rxjs';
import { Config } from '@app/config';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';

export class HumanPlayer implements IPlayer {
    playerData: PlayerData;
    readonly turnEnded: BehaviorSubject<string>;

    constructor(readonly playerInfo: PlayerInfo, readonly reserve: ReserveHandler) {
        this.playerData = { score: 0, skippedTurns: 0, rack: [] };
        this.turnEnded = new BehaviorSubject<string>(this.playerInfo.id);
    }

    async startTurn(): Promise<void> {
        return Promise.resolve();
    }

    endTurn(): void {
        this.turnEnded.next(this.playerInfo.id);
    }

    fillRack(): void {
        while (this.reserve.length > 0 && this.playerData.rack.length < Config.RACK_SIZE) {
            this.playerData.rack.push(this.reserve.drawLetter());
        }
    }

    get id(): string {
        return this.playerInfo.id;
    }
}
