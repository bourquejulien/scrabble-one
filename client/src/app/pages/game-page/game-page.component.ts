import { Component, OnInit } from '@angular/core';
import { PlayerType } from '@app/classes/player-type';
import { GameService } from '@app/services/game/game.service';
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    playerType: PlayerType = PlayerType.Local;

    constructor(private readonly gameService: GameService) {}

    ngOnInit() {
        this.gameService.onTurn.subscribe((e) => (this.playerType = e));
    }

    confirmQuit(): void {
        // TODO:
    }
}
