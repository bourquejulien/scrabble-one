import { Config } from '@app/config';
import { SkipAction } from '@app/classes/player/virtual-player/actions/skip-action';
import { ExchangeAction } from '@app/classes/player/virtual-player/actions/exchange-action';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { PlayAction } from './actions/play-action';
import { Action } from './actions/action';
import { Player } from '@app/classes/player/player';
import { PlayerInfo } from '@app/classes/player-info';
import * as logger from 'winston';
import { Timer } from '@app/classes/delay';

const MIN_PLAYTIME_MILLISECONDS = 3000;

export class VirtualPlayer extends Player {
    constructor(
        readonly playerInfo: PlayerInfo,
        private readonly dictionaryService: DictionaryService,
        private readonly runAction: (action: Action) => Action | null,
    ) {
        super();
    }

    async startTurn(): Promise<void> {
        logger.debug(`VirtualPlayer - StartTurn - Id: ${this.playerInfo.id}`);

        this.isTurn = true;
        this.socketHandler.sendData('onTurn', this.id);

        await Timer.delay(MIN_PLAYTIME_MILLISECONDS);

        let action = this.runAction(this.nextAction());
        while (action) {
            action = this.runAction(action);
        }

        this.fillRack();
        this.endTurn();
    }

    private nextAction(): Action {
        let random = Math.random();

        if (random < Config.VIRTUAL_PLAYER.EXCHANGE_PERCENTAGE && this.reserveHandler.length > 0) {
            return new ExchangeAction(this.reserveHandler, this.socketHandler, this.playerData);
        }
        random -= Config.VIRTUAL_PLAYER.EXCHANGE_PERCENTAGE;

        if (random < Config.VIRTUAL_PLAYER.SKIP_PERCENTAGE) {
            return new SkipAction(this.playerData, this.socketHandler);
        }

        const playGenerator = new PlayGenerator(this.dictionaryService, this.boardHandler, this.playerData.rack);

        return new PlayAction(this.boardHandler, playGenerator, this.playerData, this.socketHandler);
    }
}
