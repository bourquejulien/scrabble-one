import { Play } from '@app/classes/virtual-player/play';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { Action } from './action';
import { PlayerStatsNotifier } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-notifier';

export class PlaceAction implements Action {
    constructor(
        private readonly boardHandler: BoardHandler,
        private readonly statsNotifier: PlayerStatsNotifier,
        private readonly rack: string[],
        private readonly play: Play,
    ) {}

    execute(): Action | null {
        this.boardHandler.placeLetters(this.play.placements);
        this.play.placements.forEach((placement) =>
            this.rack.splice(
                this.rack.findIndex((rackLetter) => placement.letter === rackLetter),
                1,
            ),
        );

        this.statsNotifier.notifyPlacement(this.play);
        this.statsNotifier.notifyRackUpdate(this.rack);

        return null;
    }
}
