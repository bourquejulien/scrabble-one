import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

@Component({
    selector: 'app-opponent-quit',
    templateUrl: './opponent-quit.component.html',
    styleUrls: ['./opponent-quit.component.scss'],
})
export class OpponentQuitComponent {
    constructor(private readonly socketService: SocketClientService, private dialogRef: MatDialog) {}

    quit() {
        this.socketService.reset();
        this.dialogRef.closeAll();
    }

    continue() {
        this.dialogRef.closeAll();
    }
}
