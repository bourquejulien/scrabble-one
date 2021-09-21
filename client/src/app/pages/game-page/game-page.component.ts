import { Component } from '@angular/core';
import { PlayerType } from '@app/classes/player-type';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    playerType: PlayerType = PlayerType.Local;
}
