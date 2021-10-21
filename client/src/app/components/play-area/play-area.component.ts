import { Component, Input } from '@angular/core';
import { PlayerType } from '@common';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent {
    reserveSelection: Set<number>;
    @Input() playerType: PlayerType;

    constructor() {
        this.reserveSelection = new Set<number>();
    }

    cancelExchange() {
        this.reserveSelection.clear();
    }
}
