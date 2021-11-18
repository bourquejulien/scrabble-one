import { PlayerData } from '@app/classes/player-data';
import { Play } from '@app/classes/virtual-player/play';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { Action } from './action';

export class PlaceAction implements Action {
    constructor(private readonly boardHandler: BoardHandler, private readonly play: Play, private readonly playerData: PlayerData) {}

    execute(): Action | null {
        this.boardHandler.placeLetters(this.play.placements);

        this.playerData.baseScore += this.play.score;
        this.play.placements.forEach((placement) =>
            this.playerData.rack.splice(this.playerData.rack.findIndex((rackLetter) => placement.letter === rackLetter)),
        );

        this.playerData.skippedTurns = 0;

        return null;
    }
}
