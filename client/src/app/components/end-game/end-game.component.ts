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
        if (this.gameService.firstPlayerStats.points > this.gameService.secondPlayerStats.points) {
            return (
                'Félicitation au gagnant ' +
                this.sessionService.gameConfig.firstPlayerName +
                ' : ' +
                this.gameService.firstPlayerStats.points +
                ' points'
            );
        }
        if (this.gameService.firstPlayerStats.points < this.gameService.secondPlayerStats.points) {
            return (
                'Félicitation au gagnant ' +
                this.sessionService.gameConfig.secondPlayerName +
                ' : ' +
                this.gameService.secondPlayerStats.points +
                ' points'
            );
        }
        return (
            'Félicitation aux gagnants ' +
            this.sessionService.gameConfig.firstPlayerName +
            ' et ' +
            this.sessionService.gameConfig.secondPlayerName +
            ' égalité'
        );
    }
}
