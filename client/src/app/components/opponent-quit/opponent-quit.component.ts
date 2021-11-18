import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameService } from '@app/services/game/game.service';

@Component({
    selector: 'app-opponent-quit',
    templateUrl: './opponent-quit.component.html',
    styleUrls: ['./opponent-quit.component.scss'],
})
export class OpponentQuitComponent {
    constructor(private readonly gameService: GameService, private dialogRef: MatDialog) {}

    quit() {
        this.gameService.reset();
        this.dialogRef.closeAll();
    }

    continue() {
        this.dialogRef.closeAll();
    }
}
