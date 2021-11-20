import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BestScoresComponent } from '@app/components/best-scores/best-scores.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly developers: string[];
    //dialog: any;

    constructor(public dialog: MatDialog) {
        this.developers = [
            'Julien Bourque',
            'Alexandre Dufort',
            'Éloïse Brosseau',
            'Étienne Hourdebaigt',
            'Ikram Kohil',
            'Morgan De Gregorio Beaudoin',
        ];
    }

    openScoresDialog(): void {
        this.dialog.open(BestScoresComponent, { panelClass: 'init-game-dialog' });
    }
}
