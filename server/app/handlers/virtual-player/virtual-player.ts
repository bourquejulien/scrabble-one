import { Reserve } from '@app/classes/reserve/reserve';
import { Constants, PlayerData } from '@common';
import { Subject } from 'rxjs';
import { VirtualPlayerAction } from './virtual-player-action';

const MIN_PLAYTIME_MILLISECONDS = 3000;

export class VirtualPlayer {
    isPlaying: Subject<boolean>;
    playerData: PlayerData;
    // on injecte reserve dans virtualplayeraction et virtualPlayer ne devrait-on pas plutot aller chercher la meme reserve que vpaction?
    constructor(playerId: string, private readonly virtualPlayerAction: VirtualPlayerAction, private readonly reserve: Reserve) {
        this.playerData = { id: playerId, score: 0, skippedTurns: 0, rack: [] };
        this.isPlaying = new Subject<boolean>();
    }

    async startTurn() {
        await this.delay(MIN_PLAYTIME_MILLISECONDS);
        const action = this.virtualPlayerAction.getNextAction(this.playerData);

        const nextAction = action.execute();

        nextAction?.execute();

        this.fillRack();
        this.endTurn();
    }

    endTurn() {
        this.isPlaying.next(false);
    }

    fillRack(): void {
        while (this.reserve.length > 0 && this.playerData.rack.length < Constants.RACK_SIZE) {
            this.playerData.rack.push(this.reserve.drawLetter());
        }
    }

    reset(): void {
        this.playerData = { id: this.playerData.id, score: 0, skippedTurns: 0, rack: [] };
    }

    private async delay(timeMs: number, resolver?: string) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(resolver);
            }, timeMs);
        });
    }
}
