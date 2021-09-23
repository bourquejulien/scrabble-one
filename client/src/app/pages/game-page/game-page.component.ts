import { Component } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    gameService: GameService;

    constructor(gameService: GameService) {
        this.gameService = gameService;
    }

    confirmQuit(): void {
        // TODO:
    }
}
