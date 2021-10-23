import { Injectable } from '@angular/core';
import { PlayerType } from '@common';
import { Timer } from '@app/classes/time/timer';
import { TimeSpan } from '@app/classes/time/timespan';
import { Constants } from '@app/constants/global.constants';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Subject } from 'rxjs';
import { VirtualPlayerActionService } from './virtual-player-action.service';
import { PlayerData } from '@app/classes/player-data';

const MIN_PLAYTIME_SECONDS = 3;

@Injectable({
    providedIn: 'root',
})
export class VirtualPlayerService {
    turnComplete: Subject<PlayerType>;
    playerData: PlayerData;
    private minTimer: Timer;

    constructor(
        private readonly virtualPlayerActionService: VirtualPlayerActionService,
        private readonly reserveService: ReserveService,
        private readonly timerService: TimerService,
    ) {
        this.playerData = { score: 0, skippedTurns: 0, rack: [] };
        this.turnComplete = new Subject<PlayerType>();
        this.minTimer = new Timer();
    }

    async startTurn(playTime: TimeSpan) {
        this.timerService.start(playTime, PlayerType.Virtual);
        this.minTimer.start(TimeSpan.fromSeconds(MIN_PLAYTIME_SECONDS));

        const action = this.virtualPlayerActionService.getNextAction(this.playerData);

        const nextAction = action.execute();

        await this.minTimer.completed;

        nextAction?.execute();

        this.fillRack();
        this.endTurn();
    }

    endTurn() {
        this.minTimer.stop();
        this.timerService.stop();
        this.turnComplete.next(PlayerType.Virtual);
    }

    fillRack(): void {
        while (this.reserveService.length > 0 && this.playerData.rack.length < Constants.RACK_SIZE) {
            this.playerData.rack.push(this.reserveService.drawLetter());
        }
    }

    reset(): void {
        this.playerData = { score: 0, skippedTurns: 0, rack: [] };
        this.minTimer.stop();
    }
}
