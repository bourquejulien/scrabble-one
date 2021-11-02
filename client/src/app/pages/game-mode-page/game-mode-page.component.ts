import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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

    createOnlineGame(): void {
        this.openDialog(GameType.Multiplayer);
        this.socket.socketClient.emit('newOnlineGame');
    }
}
