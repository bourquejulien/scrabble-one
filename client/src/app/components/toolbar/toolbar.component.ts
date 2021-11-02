import { Component, Input } from '@angular/core';
import { SessionService } from '@app/services/session/session.service';
import { TimerService } from '@app/services/timer/timer.service';
import { PlayerType } from '@app/classes/player/player-type';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
    @Input() playerType: PlayerType;
    constructor(readonly sessionService: SessionService, readonly timerService: TimerService) {}
}
