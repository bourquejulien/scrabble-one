import { PlayerData } from '@app/classes/player-data';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Action } from './action';
import { PlaceAction } from './place-action';

const MAX_PLAYTIME_SECONDS = 20;

export class PlayAction implements Action {
    constructor(
        private readonly boardService: BoardService,
        private readonly timerService: TimerService,
        private readonly playGenerator: PlayGenerator,
        private readonly playerData: PlayerData,
    ) {}

    execute(): Action | null {
        const scoreRange = this.getScoreRange();

        const startTime = this.timerService.time;

        while (startTime.totalMilliseconds - this.timerService.time.totalMilliseconds <= MAX_PLAYTIME_SECONDS && this.playGenerator.generateNext());

        const filteredPlays = this.playGenerator.orderedPlays.filter((e) => e.score >= scoreRange.min && e.score <= scoreRange.max);

        if (filteredPlays.length === 0) {
            return null;
        }

        const play = filteredPlays[Math.floor(Math.random() * filteredPlays.length)];

        return new PlaceAction(this.boardService, play, this.playerData);
    }

    private getScoreRange(): { min: number; max: number } {
        let random = Math.random();
        const scoreRanges = Constants.virtualPlayer.SCORE_RANGE;

        for (const scoreRange of scoreRanges) {
            if (random < scoreRange.percentage) {
                return scoreRange.range;
            }
            random -= scoreRange.percentage;
        }

        return { min: 0, max: 0 };
    }
}
