import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GameType } from '@app/classes/game-type';
import { InitGameComponent } from '@app/components/init-game/init-game.component';

@Component({
    selector: 'app-game-mode-page',
    templateUrl: './game-mode-page.component.html',
    styleUrls: ['./game-mode-page.component.scss'],
})
export class GameModePageComponent {
    gameType = GameType;
    route: Router;
    constructor(public dialog: MatDialog, private readonly socket: SocketClientService, public router: Router) {
        this.route = router;
    }

    openDialog(type: GameType): void {
        const dialogRef = this.dialog.open(InitGameComponent, { panelClass: 'init-game-dialog', data: { gameModeType: type } });
        dialogRef.afterClosed().subscribe();
    }

    createOnlineGame(): void {
        this.openDialog(GameType.Solo);
        this.route.navigate(['waiting-room']);
        this.socket.socketClient.emit('newOnlineGame');
    }
}
