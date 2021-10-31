import { Component, Input } from '@angular/core';
import { PlayerType } from '@app/classes/player/player-type';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent {
    @Input() playerType: PlayerType;
    reserveSelection: Set<number>;

    constructor() {
        this.reserveSelection = new Set<number>();
    }
}
