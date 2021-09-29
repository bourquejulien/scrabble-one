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

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerActionService {
    constructor(
        private readonly boardService: BoardService,
        private readonly timerService: TimerService,
        private readonly reserveService: ReserveService,
        private readonly dictionaryService: DictionaryService,
    ) {}

    getNextAction(playerData: PlayerData) {
        let random = Math.random();

        if (random <= Constants.virtualPlayer.SKIP_PERCENTAGE) {
            return new SkipAction();
        }
        random -= Constants.virtualPlayer.SKIP_PERCENTAGE;

        if (random <= Constants.virtualPlayer.EXCHANGE_PERCENTAGE) {
            return new ExchangeAction(this.reserveService, playerData.rack);
        }

        const playGenerator = new PlayGenerator(this.dictionaryService, this.boardService, playerData.rack);

        return new PlayAction(this.boardService, this.timerService, playGenerator, playerData);
    }
}
