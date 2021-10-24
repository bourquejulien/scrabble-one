import { BoardHandler } from '@app/classes/board/board-handler';
import { Play } from '@app/classes/virtual-player/play';
import { PlayerData } from '@common';
import { Action } from './action';

export class PlaceAction implements Action {
    constructor(private readonly boardHandler: BoardHandler, private readonly play: Play, private readonly playerData: PlayerData) {}

    execute(): Action | null {
        this.boardHandler.placeLetters(this.play.letters);

        this.playerData.score += this.play.score;
        this.play.letters.forEach((letter) =>
            this.playerData.rack.splice(this.playerData.rack.findIndex((rackLetter) => letter.letter === rackLetter)),
        );

        this.playerData.skippedTurns = 0;

        return null;
    }
}
