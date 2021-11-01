import { Component } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { SessionService } from '@app/services/session/session.service';

@Component({
    selector: 'app-end-game',
    templateUrl: './end-game.component.html',
    styleUrls: ['./end-game.component.scss'],
})
export class EndGameComponent {
    constructor(private readonly gameService: GameService, private readonly sessionService: SessionService) {}

    winner(): string {
        if (this.gameService.stats.localStats.points > this.gameService.stats.remoteStats.points) {
            return (
                'Félicitation au gagnant ' +
                this.sessionService.gameConfig.firstPlayerName +
                ':' +
                this.gameService.stats.localStats.points +
                ' points'
            );
        }
        if (this.gameService.stats.localStats.points < this.gameService.stats.remoteStats.points) {
            return (
                'Félicitation au gagnant ' +
                this.sessionService.gameConfig.secondPlayerName +
                ':' +
                this.gameService.stats.remoteStats.points +
                ' points'
            );
        } else {
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
