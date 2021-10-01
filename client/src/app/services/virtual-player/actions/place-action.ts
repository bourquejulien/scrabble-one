import { PlayerData } from '@app/classes/player-data';
import { Play } from '@app/classes/virtual-player/play';
import { BoardService } from '@app/services/board/board.service';
import { Action } from './action';

export class PlaceAction implements Action {
    constructor(private readonly boardService: BoardService, private readonly play: Play, private readonly playerData: PlayerData) {}

    execute(): Action | null {
        this.boardService.placeLetters(this.play.letters);

        this.playerData.score += this.play.score;
        this.play.letters.forEach((letter) =>
            this.playerData.rack.splice(this.playerData.rack.findIndex((rackLetter) => letter.letter === rackLetter)),
        );

        return null;
    }
}
