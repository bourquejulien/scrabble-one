import { Injectable } from '@angular/core';
import { EndGameComponent } from '@app/components/end-game/end-game.component';
import { MatDialog } from '@angular/material/dialog';
// eslint-disable-next-line no-restricted-imports
import { GameService } from '../game/game.service';

@Injectable({
    providedIn: 'root',
})
export class EndGameService {
    constructor(private readonly gameService: GameService, public dialog: MatDialog) {
        gameService.gameEnding.subscribe(() => this.endGame());
    }

    endGame() {
        const dialogRef = this.dialog.open(EndGameComponent);
        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.gameService.resetGame();
            }
        });
    }
}
