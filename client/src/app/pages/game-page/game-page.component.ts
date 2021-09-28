import { Component } from '@angular/core';
import { PlayerType } from '@app/classes/player-type';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    gameService: GameService;
    timerService: TimerService;
    playerType: PlayerType;

    constructor(gameService: GameService, timerService: TimerService) {
        this.gameService = gameService;
        this.playerType = gameService.onTurn.getValue();
        this.timerService = timerService;
        gameService.onTurn.subscribe((e) => (this.playerType = e));
    }

    confirmQuit(): void {
        // TODO:
    }
}
