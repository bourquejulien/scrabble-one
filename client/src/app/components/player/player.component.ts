import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LetterInterface } from '@app/classes/letter';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
})

// how does it know which property to get from parent?
export class PlayerComponent implements OnInit {
    @Input() name!: string;
    @Input() isTurn!: boolean; // could be null?
    @Input() rack!: LetterInterface[];
    @Input() playerType!: string; // human - advanced

    @Output() turnIsOver = new EventEmitter();

    constructor() {}

    ngOnInit(): void {}

    onTurn() {
        if (this.playerType.startsWith('human')) {
        }
    }
}
