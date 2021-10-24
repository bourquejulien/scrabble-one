import { BoardHandler } from '@app/classes/board/board-handler';
import { MessageType } from '@app/classes/messaging/message';
import { Messaging } from '@app/classes/messaging/messaging';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { Constants, PlayerData, PlayerType } from '@common';
import { Action } from './action';
import { PlaceAction } from './place-action';

const MAX_PLAYTIME_MILISECONDS = 20000;
const INTERVAL_TIME = 100;

export class PlayAction implements Action {
    constructor(
        private readonly boardHandler: BoardHandler,
        private readonly playGenerator: PlayGenerator,
        private readonly playerData: PlayerData,
        private readonly messaging: Messaging,
    ) {}

    execute(): Action | null {
        const scoreRange = this.getScoreRange();

        let ranCounter = 0;
        const timerInterval = setInterval(() => {
            if (ranCounter * INTERVAL_TIME < MAX_PLAYTIME_MILISECONDS && this.playGenerator.generateNext()) {
                ranCounter++;
            } else {
                clearInterval(timerInterval);
            }
        }, INTERVAL_TIME);

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
        this.messaging.send('', 'Mot alternatifs: ' + alternatives, MessageType.Log, PlayerType.Virtual);
        return new PlaceAction(this.boardHandler, play, this.playerData);
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
