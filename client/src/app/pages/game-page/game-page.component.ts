import { Component } from '@angular/core';
import { PlayerType } from '@app/classes/player-type';
import { GameService } from '@app/services/game.service';
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    playerType: PlayerType = PlayerType.Local;
    joueur1: string = 'default';
    joueur2: string = 'bot'
    constructor(public game: GameService) {
        this.joueur1 = this.game.firstPlayerName;
        this.joueur2 = this.game.secondPlayerName; 

    }

    confirmQuit(): void {
        // TODO:
    }
}
