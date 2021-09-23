import { Component } from '@angular/core';
import { PlayerType } from '@app/classes/player-type';
import { GameService } from '@app/services/game/game.service';
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    gameService: GameService;
    playerType: PlayerType = PlayerType.Local;
    joueur1: string = 'default';
    joueur2: string = 'bot';
    constructor(gameService: GameService) {
        this.gameService = gameService;
        this.joueur1 = this.gameService.gameConfig.firstPlayerName;
        this.joueur2 = this.gameService.gameConfig.secondPlayerName;
    }

    confirmQuit(): void {
        // TODO:
    }
}
