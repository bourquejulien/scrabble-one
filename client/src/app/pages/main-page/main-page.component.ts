import { Component } from '@angular/core';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string;
    readonly developers: string[];

    constructor() {
        this.title = 'LOG2990';
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
