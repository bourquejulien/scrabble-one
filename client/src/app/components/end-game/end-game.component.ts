import { Component } from '@angular/core';
import { GameService } from '@app/services/game/game.service';

@Component({
    selector: 'app-end-game',
    templateUrl: './end-game.component.html',
    styleUrls: ['./end-game.component.scss'],
})
export class EndGameComponent {
    constructor(private readonly gameService: GameService) {}

    winner(): string {
        if (this.gameService.firstPlayerStats.points > this.gameService.secondPlayerStats.points) {
            return (
                'Félicitation au gagnant ' + this.gameService.gameConfig.firstPlayerName + ':' + this.gameService.firstPlayerStats.points + ' points'
            );
        }
        if (this.gameService.firstPlayerStats.points < this.gameService.secondPlayerStats.points) {
            return (
                'Félicitation au gagnant ' +
                this.gameService.gameConfig.secondPlayerName +
                ':' +
                this.gameService.secondPlayerStats.points +
                ' points'
            );
        } else {
            return (
                'Félicitation aux gagnants ' +
                this.gameService.gameConfig.firstPlayerName +
                ' et ' +
                this.gameService.gameConfig.secondPlayerName +
                ' égalité'
            );
        }
    }
}
