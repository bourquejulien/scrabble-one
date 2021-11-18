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
import { PlayAction } from '@app/classes/player/virtual-player/actions/play-action';
import { PlayerStatsHandler } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-handler';

export class PlayActionExpert extends PlayAction {
    constructor(
        private readonly boardHandler: BoardHandler,
        private readonly playGenerator: PlayGenerator,
        private readonly rack: string[],
        private readonly statsHandler: PlayerStatsHandler,
        private readonly socketHandler: SocketHandler,
        private readonly reserveHandler: ReserveHandler,
    ) {
        super();
    }

    execute(): Action | null {
        logger.debug('Generating plays - Expert');

        while (this.playGenerator.generateNext());

        const orderedPlays = this.playGenerator.orderedPlays;

        if (orderedPlays.length === 0) {
            logger.debug('No play generated - Exchange');
            return new ExchangeAction(this.reserveHandler, this.socketHandler, this.statsHandler, this.rack, false);
        }

        const play = orderedPlays[0];

        this.socketHandler.sendMessage({ title: 'Mot placé', body: this.formatPlay(play), messageType: MessageType.Message });
        this.socketHandler.sendMessage({
            title: 'Mot alternatifs',
            body: this.formatPlays(orderedPlays.slice(1, Config.VIRTUAL_PLAYER.NB_ALTERNATIVES + 1)),
            messageType: MessageType.Log,
        });

        return new PlaceAction(this.boardHandler, this.statsHandler, this.rack, play);
    }
}
