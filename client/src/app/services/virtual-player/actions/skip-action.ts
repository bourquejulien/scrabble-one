import { PlayerData } from '@app/classes/player-data';
import { Action } from './action';

export class SkipAction implements Action {
    constructor(private readonly playerData: PlayerData) {}

    execute(): Action | null {
        this.playerData.skippedTurns++;
        return null;
    }
}