import { Component, Inject } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { SessionService } from '@app/services/session/session.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EndGameWinner } from '@app/classes/end-game-winner';

@Component({
    selector: 'app-end-game',
    templateUrl: './end-game.component.html',
    styleUrls: ['./end-game.component.scss'],
})
export class EndGameComponent {
    constructor(
        private readonly gameService: GameService,
        private readonly sessionService: SessionService,
        @Inject(MAT_DIALOG_DATA) private readonly data: { winner: EndGameWinner },
    ) {}

    winner(): string {
        switch (this.data.winner) {
            case EndGameWinner.Local:
                return (
                    'Félicitation au gagnant ' +
                    this.sessionService.gameConfig.firstPlayerName +
                    ' : ' +
                    this.gameService.stats.localStats.points +
                    ' points'
                );
            case EndGameWinner.Remote:
                return (
                    'Félicitation au gagnant ' +
                    this.sessionService.gameConfig.secondPlayerName +
                    ' : ' +
                    this.gameService.stats.remoteStats.points +
                    ' points'
                );
            case EndGameWinner.Draw:
                return (
                    'Félicitation aux gagnants ' +
                    this.sessionService.gameConfig.firstPlayerName +
                    ' et ' +
                    this.sessionService.gameConfig.secondPlayerName +
                    ' égalité'
                );
        }
    }
}
