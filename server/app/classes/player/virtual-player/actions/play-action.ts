import { PlayerData } from '@app/classes/player-data';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { Action } from './action';
import { PlaceAction } from './place-action';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { Config } from '@app/config';

// const MAX_PLAYTIME_MILLISECONDS = 20000;
// const INTERVAL_TIME = 100;

// TODO add messaging over sockets
export class PlayAction implements Action {
    constructor(
        private readonly boardHandler: BoardHandler,
        private readonly playGenerator: PlayGenerator,
        private readonly playerData: PlayerData /* private readonly messaging: Messaging, */,
    ) {}

    private static getScoreRange(): { min: number; max: number } {
        let random = Math.random();
        const scoreRanges = Config.VIRTUAL_PLAYER.SCORE_RANGE;

        for (const scoreRange of scoreRanges) {
            if (random < scoreRange.percentage) {
                return scoreRange.range;
            }
            random -= scoreRange.percentage;
        }

        return { min: 0, max: 0 };
    }

    execute(): Action | null {
        const scoreRange = PlayAction.getScoreRange();

        // TODO Re-add timer?
        /*
        let ranCounter = 0;
        const timerInterval = setInterval(() => {
            if (ranCounter * INTERVAL_TIME < MAX_PLAYTIME_MILLISECONDS && this.playGenerator.generateNext()) {
                ranCounter++;
            } else {
                clearInterval(timerInterval);
            }
        }, INTERVAL_TIME);

         */

        while (this.playGenerator.generateNext());

        const filteredPlays = this.playGenerator.orderedPlays.filter((e) => e.score >= scoreRange.min && e.score <= scoreRange.max);

        if (filteredPlays.length === 0) {
            return null;
        }

        const chosenPlay = Math.floor(Math.random() * filteredPlays.length);
        const play = filteredPlays[chosenPlay];

        /*
        let alternatives = '';
        for (let i = 0; i < Constants.NB_ALTERNATIVES; i++) {
            const alternativeIndex = (chosenPlay + i) % filteredPlays.length;
            alternatives += filteredPlays[alternativeIndex].word + ' ';
        }
        */

        // this.messaging.send('', 'Mot alternatifs: ' + alternatives, MessageType.Log, PlayerType.Virtual);

        return new PlaceAction(this.boardHandler, play, this.playerData);
    }
}
