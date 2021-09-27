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
    playerType: PlayerType;

    constructor(gameService: GameService) {
        this.gameService = gameService;
        this.playerType = gameService.onTurn.getValue();
        gameService.onTurn.subscribe((e) => (this.playerType = e));
    }

    confirmQuit(): void {
        // TODO:
    }
}
