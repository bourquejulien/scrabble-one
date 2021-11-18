import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { Action } from '@app/classes/player/virtual-player/actions/action';
import { PlayerInfo } from '@app/classes/player-info';
import * as logger from 'winston';
import { VirtualPlayer } from '@app/classes/player/virtual-player/virtual-player';
import { PlayActionExpert } from '@app/classes/player/virtual-player/virtual-player-expert/actions/play-action-expert';
import { DictionaryHandler } from '@app/handlers/dictionary-handler/dictionary-handler';

export class VirtualPlayerExpert extends VirtualPlayer {
    constructor(private readonly dictionaryHandler: DictionaryHandler, playerInfo: PlayerInfo, runAction: (action: Action) => Action | null) {
        super(runAction, playerInfo);
    }

    protected nextAction(): Action {
        logger.debug(`VirtualPlayerExpert: ${this.id} - PlayAction`);
        const playGenerator = new PlayGenerator(this.dictionaryHandler, this.boardHandler, this.playerData.rack);

        return new PlayActionExpert(this.boardHandler, playGenerator, this.playerData, this.socketHandler, this.reserveHandler);
    }
}
