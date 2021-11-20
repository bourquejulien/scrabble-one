import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BestScoresComponent } from '@app/components/best-scores/best-scores.component';
import { InitGameComponent } from '@app/components/init-game/init-game.component';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GameType } from '@common';

@Component({
    selector: 'app-game-mode-page',
    templateUrl: './game-mode-page.component.html',
    styleUrls: ['./game-mode-page.component.scss'],
})
export class GameModePageComponent {
    gameType;
    constructor(public dialog: MatDialog, private readonly socket: SocketClientService) {
        this.gameType = GameType;
    }

    openDialog(type: GameType): void {
        const dialogRef = this.dialog.open(InitGameComponent, { panelClass: 'init-game-dialog', data: { gameModeType: type } });
        dialogRef.afterClosed().subscribe();
    }

    openScoresDialog(): void {
        this.dialog.open(BestScoresComponent, { panelClass: 'init-game-dialog' });
    }

    createOnlineGame(): void {
        this.openDialog(GameType.Multiplayer);
        this.socket.send('newOnlineGame');
    }
}
