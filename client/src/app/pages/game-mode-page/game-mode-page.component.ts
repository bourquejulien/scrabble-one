import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameType } from '@app/classes/game-type';
import { InitGameComponent } from '@app/components/init-game/init-game.component';

@Component({
    selector: 'app-game-mode-page',
    templateUrl: './game-mode-page.component.html',
    styleUrls: ['./game-mode-page.component.scss'],
})
export class GameModePageComponent {
    gameType = GameType;
    constructor(public dialog: MatDialog) {}

    openDialog(type: GameType): void {
        const dialogRef = this.dialog.open(InitGameComponent, { panelClass: 'init-game-dialog', data: { gameModeType: type } });
        dialogRef.afterClosed().subscribe();
    }
}
