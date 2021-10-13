import { MessageType } from '@common/message';
import { PlayerData } from '@app/classes/player-data';
import { PlayerType } from '@common/player-type';
import { TimeSpan } from '@app/classes/time/timespan';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';
import { MessagingService } from '@app/services/messaging/messaging.service';
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
        private readonly messagingService: MessagingService,
    ) {}

    execute(): Action | null {
        const scoreRange = this.getScoreRange();

        const startTime = this.timerService.time;

        while (this.shouldRun(startTime) && this.playGenerator.generateNext());

        const filteredPlays = this.playGenerator.orderedPlays.filter((e) => e.score >= scoreRange.min && e.score <= scoreRange.max);

        if (filteredPlays.length === 0) {
            return null;
        }

        const chosenPlay = Math.floor(Math.random() * filteredPlays.length);
        const play = filteredPlays[chosenPlay];
        let alternatives = '';
        for (let i = 0; i < Constants.NB_ALTERNATIVES; i++) {
            const alternativeIndex = (chosenPlay + i) % filteredPlays.length;
            alternatives += filteredPlays[alternativeIndex].word + ' ';
        }
        this.messagingService.send('', 'Mot alternatifs: ' + alternatives, MessageType.Log, PlayerType.Virtual);
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

    private shouldRun(startTime: TimeSpan) {
        return this.timerService.time.seconds >= 0 && startTime.seconds - this.timerService.time.seconds < MAX_PLAYTIME_SECONDS;
    }
}
