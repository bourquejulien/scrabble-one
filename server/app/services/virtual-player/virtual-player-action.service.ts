import { Injectable } from '@angular/core';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { ExchangeAction } from './actions/exchange-action';
import { PlayAction } from './actions/play-action';
import { SkipAction } from './actions/skip-action';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { PlayerData } from '@app/classes/player-data';
import { Action } from './actions/action';
import { MessagingService } from '@app/services/messaging/messaging.service';

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerActionService {
    constructor(
        private readonly boardService: BoardService,
        private readonly timerService: TimerService,
        private readonly reserveService: ReserveService,
        private readonly dictionaryService: DictionaryService,
        private readonly messagingService: MessagingService,
    ) {}

    getNextAction(playerData: PlayerData): Action {
        let random = Math.random();

        if (random < Constants.virtualPlayer.SKIP_PERCENTAGE) {
            return new SkipAction(playerData);
        }
        random -= Constants.virtualPlayer.SKIP_PERCENTAGE;

        if (random < Constants.virtualPlayer.EXCHANGE_PERCENTAGE) {
            return new ExchangeAction(this.reserveService, this.messagingService, playerData);
        }

        const playGenerator = new PlayGenerator(this.dictionaryService, this.boardService, playerData.rack);

        return new PlayAction(this.boardService, this.timerService, playGenerator, playerData, this.messagingService);
    }
}
