import { Component } from '@angular/core';
import { GameMode } from '@common';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    gameMode = GameMode;
    readonly developers: string[];

    constructor() {
        this.developers = [
            'Julien Bourque',
            'Alexandre Dufort',
            'Éloïse Brosseau',
            'Étienne Hourdebaigt',
            'Ikram Kohil',
            'Morgan De Gregorio Beaudoin',
        ];
    }
}
