import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { Action } from '@app/classes/player/virtual-player/actions/action';
import { PlayerInfo } from '@app/classes/player-info';
import * as logger from 'winston';
import { VirtualPlayer } from '@app/classes/player/virtual-player/virtual-player';
import { PlayActionExpert } from '@app/classes/player/virtual-player/virtual-player-expert/actions/play-action-expert';

export class VirtualPlayerExpert extends VirtualPlayer {
    constructor(private readonly dictionaryService: DictionaryService, playerInfo: PlayerInfo, runAction: (action: Action) => Action | null) {
        super(runAction, playerInfo);
    }

    protected nextAction(): Action {
        logger.debug(`VirtualPlayerExpert: ${this.id} - PlayAction`);
        const playGenerator = new PlayGenerator(this.dictionaryService, this.boardHandler, this.rack);

        return new PlayActionExpert(this.boardHandler, playGenerator, this.rack, this.statsNotifier, this.socketHandler, this.reserveHandler);
    }
}
