import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InitSoloModeComponent } from '@app/components/init-solo-mode/init-solo-mode.component';

@Component({
    selector: 'app-game-mode-page',
    templateUrl: './game-mode-page.component.html',
    styleUrls: ['./game-mode-page.component.scss'],
})
export class GameModePageComponent {
    // name: string;
    // gameType: string;
    // time: number;
    constructor(public dialog: MatDialog) {}
    openDialog(): void {
        const dialogRef = this.dialog.open(InitSoloModeComponent, {
            // data: { name: this.name, gameType: this.gameType, time: this.time },
        });

        dialogRef
            .afterClosed()
            .subscribe
            // (result) => {
            // this.name = result;
            // }
            ();
    }
}
