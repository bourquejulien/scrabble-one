import { PlayerData } from '@app/classes/player-data';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { Action } from './action';
import { PlaceAction } from './place-action';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { Config } from '@app/config';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { MessageType } from '@common';
import * as logger from 'winston';
import { SkipAction } from '@app/classes/player/virtual-player/actions/skip-action';

export class PlayAction implements Action {
    constructor(
        private readonly boardHandler: BoardHandler,
        private readonly playGenerator: PlayGenerator,
        private readonly playerData: PlayerData,
        private readonly socketHandler: SocketHandler,
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

        logger.debug('Generating plays');
        while (this.playGenerator.generateNext());

        const filteredPlays = this.playGenerator.orderedPlays.filter((e) => e.score >= scoreRange.min && e.score <= scoreRange.max);

        if (filteredPlays.length === 0) {
            logger.debug('No play generated - Skipping');
            return new SkipAction(this.playerData, this.socketHandler);
        }

        const chosenPlay = Math.floor(Math.random() * filteredPlays.length);
        const play = filteredPlays[chosenPlay];

        const alternatives = new Set<string>();
        for (let i = 0; alternatives.size < Config.VIRTUAL_PLAYER.NB_ALTERNATIVES && i < filteredPlays.length; i++) {
            const alternativeIndex = (chosenPlay + i) % filteredPlays.length;
            alternatives.add(filteredPlays[alternativeIndex].word);
        }

        this.socketHandler.sendMessage({ title: '', body: 'Mot placé : ' + play.word, messageType: MessageType.Message });
        this.socketHandler.sendMessage({ title: '', body: 'Mot alternatifs : ' + Array.from(alternatives).toString(), messageType: MessageType.Log });

        return new PlaceAction(this.boardHandler, play, this.playerData);
    }
}
