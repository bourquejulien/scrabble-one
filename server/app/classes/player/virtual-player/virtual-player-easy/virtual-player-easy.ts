import { Config } from '@app/config';
import { SkipAction } from '@app/classes/player/virtual-player/actions/skip-action';
import { ExchangeAction } from '@app/classes/player/virtual-player/actions/exchange-action';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { PlayActionEasy } from '@app/classes/player/virtual-player/virtual-player-easy/actions/play-action-easy';
import { Action } from '@app/classes/player/virtual-player/actions/action';
import { PlayerInfo } from '@app/classes/player-info';
import * as logger from 'winston';
import { VirtualPlayer } from '@app/classes/player/virtual-player/virtual-player';

export class VirtualPlayerEasy extends VirtualPlayer {
    constructor(private readonly dictionaryService: DictionaryService, playerInfo: PlayerInfo, runAction: (action: Action) => Action | null) {
        super(runAction, playerInfo);
    }

    protected nextAction(): Action {
        let random = Math.random();

        if (random < Config.VIRTUAL_PLAYER.EXCHANGE_PERCENTAGE) {
            logger.debug(`VirtualPlayerEasy: ${this.id} - ExchangeAction`);
            return new ExchangeAction(this.reserveHandler, this.socketHandler, this.statsNotifier, this.rack, true);
        }
        random -= Config.VIRTUAL_PLAYER.EXCHANGE_PERCENTAGE;

        if (random < Config.VIRTUAL_PLAYER.SKIP_PERCENTAGE) {
            logger.debug(`VirtualPlayerEasy: ${this.id} - SkipAction`);
            return new SkipAction(this.statsNotifier, this.socketHandler);
        }

        logger.debug(`VirtualPlayerEasy: ${this.id} - PlayAction`);
        const playGenerator = new PlayGenerator(this.dictionaryService, this.boardHandler, this.rack);

        return new PlayActionEasy(this.boardHandler, playGenerator, this.statsNotifier, this.socketHandler, this.rack);
    }
}
