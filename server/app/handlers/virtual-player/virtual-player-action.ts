import { BoardHandler } from '@app/classes/board/board-handler';
import { Messaging } from '@app/classes/messaging/messaging';
import { Reserve } from '@app/classes/reserve/reserve';
import { Action } from '@app/classes/virtual-player/actions/action';
import { ExchangeAction } from '@app/classes/virtual-player/actions/exchange-action';
import { PlayAction } from '@app/classes/virtual-player/actions/play-action';
import { SkipAction } from '@app/classes/virtual-player/actions/skip-action';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { Constants, PlayerData } from '@common';

export class VirtualPlayerAction {
    constructor(
        // SessionService => Toutes les informations de la partie (board)
        private readonly boardHandler: BoardHandler,
        private readonly reserve: Reserve,
        private readonly dictionaryService: DictionaryService,
        private readonly messaging: Messaging,
    ) {}

    getNextAction(playerData: PlayerData): Action {
        let random = Math.random();

        if (random < Constants.virtualPlayer.SKIP_PERCENTAGE) {
            return new SkipAction(playerData);
        }
        random -= Constants.virtualPlayer.SKIP_PERCENTAGE;

        if (random < Constants.virtualPlayer.EXCHANGE_PERCENTAGE) {
            return new ExchangeAction(this.reserve, this.messaging, playerData);
        }

        // Effectue des actions sur la reserve et va checher le bon board 'a partir de playerData.id

        const playGenerator = new PlayGenerator(this.dictionaryService, this.boardHandler, playerData.rack);

        return new PlayAction(this.boardHandler, playGenerator, playerData, this.messaging);
    }
}
