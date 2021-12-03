import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { Config } from '@app/config';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { MessageType } from '@common';
import * as logger from 'winston';
import { SkipAction } from '@app/classes/player/virtual-player/actions/skip-action';
import { Action } from '@app/classes/player/virtual-player/actions/action';
import { PlaceAction } from '@app/classes/player/virtual-player/actions/place-action';
import { Play } from '@app/classes/virtual-player/play';
import { PlayerStatsNotifier } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-notifier';
import { ConsoleFormatter } from '@app/classes/player/console-formatter/console-formatter';

export class PlayActionEasy implements Action {
    constructor(
        private readonly boardHandler: BoardHandler,
        private readonly playGenerator: PlayGenerator,
        private readonly statsNotifier: PlayerStatsNotifier,
        private readonly socketHandler: SocketHandler,
        private readonly rack: string[],
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
        const scoreRange = PlayActionEasy.getScoreRange();

        logger.debug('Generating plays - Easy');
        while (this.playGenerator.generateNext());

        const filteredPlays = this.playGenerator.orderedPlays.filter((e) => e.score >= scoreRange.min && e.score <= scoreRange.max);

        if (filteredPlays.length === 0) {
            logger.debug('No play generated - Skipping');
            return new SkipAction(this.statsNotifier, this.socketHandler);
        }

        const chosenPlay = Math.floor(Math.random() * filteredPlays.length);
        const play = filteredPlays[chosenPlay];

        const alternatives: Play[] = [];
        for (let i = 0; alternatives.length < Config.VIRTUAL_PLAYER.NB_ALTERNATIVES && i < filteredPlays.length; i++) {
            const alternativeIndex = (chosenPlay + i) % filteredPlays.length;
            alternatives.push(filteredPlays[alternativeIndex]);
        }

        this.socketHandler.sendMessage({ title: 'Mot placé', body: ConsoleFormatter.formatPlay(play), messageType: MessageType.Message });
        this.socketHandler.sendMessage({ title: 'Mot alternatifs', body: ConsoleFormatter.formatPlays(alternatives), messageType: MessageType.Log });

        return new PlaceAction(this.boardHandler, this.statsNotifier, this.rack, play);
    }
}
