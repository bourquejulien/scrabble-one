import { Injectable } from '@angular/core';
import { PlayerType } from '@app/classes/player-type';
import { Constants } from '@app/constants/global.constants';
import { TimerService } from '@app/services/timer/timer.service';
import { TimeSpan } from '@app/classes/time/timespan';
import { Timer } from '@app/classes/time/timer';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { Subject } from 'rxjs';
import { VirtualPlayerActionService } from './virtual-player-action.service';
import { PlayerData } from '@app/classes/player-data';

const MAX_PLAYTIME_SECONDS = 20;
const MIN_PLAYTIME_SECONDS = 3;

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerService {
    turnComplete: Subject<PlayerType>;
    private playerData: PlayerData;
    private minTimer: Timer;

    constructor(
        private readonly virtualPlayerActionService: VirtualPlayerActionService,
        private readonly reserveService: ReserveService,
        private readonly timerService: TimerService,
    ) {
        this.playerData = { score: 0, rack: [] };
        this.turnComplete = new Subject<PlayerType>();
        this.minTimer = new Timer(TimeSpan.fromSeconds(MIN_PLAYTIME_SECONDS));
    }

    async startTurn() {
        this.timerService.start(TimeSpan.fromSeconds(MAX_PLAYTIME_SECONDS), PlayerType.Virtual);
        this.minTimer.start();

        const action = this.virtualPlayerActionService.getNextAction(this.playerData);

        const nextAction = action.execute();

        await this.minTimer.completed;

        nextAction?.execute();

        this.fillRack();
        this.endTurn();
    }

    endTurn() {
        this.minTimer.stop();
        this.timerService.reset();
        this.turnComplete.next(PlayerType.Virtual);
    }

    fillRack(): void {
        while (this.reserveService.length > 0 && this.playerData.rack.length < Constants.MIN_SIZE) {
            this.playerData.rack.push(this.reserveService.drawLetter());
        }
    }
}
