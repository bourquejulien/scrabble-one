import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InitSoloModeComponent } from '@app/components/init-solo-mode/init-solo-mode.component';
import { GameType } from '@app/classes/game-type';

@Component({
    selector: 'app-game-mode-page',
    templateUrl: './game-mode-page.component.html',
    styleUrls: ['./game-mode-page.component.scss'],
})
export class GameModePageComponent {
    gameType = GameType;
    constructor(public dialog: MatDialog) {}

    openDialog(type: GameType): void {
        const dialogRef = this.dialog.open(InitSoloModeComponent, { panelClass: 'init-solo-mode-dialog', data: { gameModeType: type } });
        dialogRef.afterClosed().subscribe();
    }
}
