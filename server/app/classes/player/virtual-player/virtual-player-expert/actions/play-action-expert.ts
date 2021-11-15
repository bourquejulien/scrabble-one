import { PlayerData } from '@app/classes/player-data';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { Config } from '@app/config';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { MessageType } from '@common';
import * as logger from 'winston';
import { Action } from '@app/classes/player/virtual-player/actions/action';
import { PlaceAction } from '@app/classes/player/virtual-player/actions/place-action';
import { ExchangeAction } from '@app/classes/player/virtual-player/actions/exchange-action';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';

export class PlayActionExpert implements Action {
    constructor(
        private readonly boardHandler: BoardHandler,
        private readonly playGenerator: PlayGenerator,
        private readonly playerData: PlayerData,
        private readonly socketHandler: SocketHandler,
        private readonly reserveHandler: ReserveHandler,
    ) {}

    execute(): Action | null {
        logger.debug('Generating plays - Expert');
        while (this.playGenerator.generateNext());

        const orderedPlays = this.playGenerator.orderedPlays;

        if (orderedPlays.length === 0) {
            logger.debug('No play generated - Exchange');
            return new ExchangeAction(this.reserveHandler, this.socketHandler, this.playerData, false);
        }

        const play = orderedPlays[0];

        const alternatives = new Set<string>();
        for (let i = 1; alternatives.size < Config.VIRTUAL_PLAYER.NB_ALTERNATIVES && i < orderedPlays.length; i++) {
            alternatives.add(orderedPlays[i].word);
        }

        this.socketHandler.sendMessage({ title: '', body: 'Mot placé : ' + play.word, messageType: MessageType.Message });
        this.socketHandler.sendMessage({ title: '', body: 'Mot alternatifs : ' + Array.from(alternatives).toString(), messageType: MessageType.Log });

        return new PlaceAction(this.boardHandler, play, this.playerData);
    }
}
