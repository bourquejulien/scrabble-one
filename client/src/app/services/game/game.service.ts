import { Injectable } from '@angular/core';
import { GameConfig } from '@app/classes/game-config';
import { PlayerType } from '@app/classes/player-type';
import { Constants } from '@app/constants/global.constants';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    onTurn: BehaviorSubject<PlayerType> = new BehaviorSubject<PlayerType>(PlayerType.Local);
    gameConfig: GameConfig;

    startGame(gameConfig: GameConfig) {
        this.gameConfig = gameConfig;
        this.nextTurn();
    }

    endGame() {

    }

    nextTurn() {
        this.onTurn.next(this.onTurn.getValue() === PlayerType.Local ? PlayerType.Virtual : PlayerType.Local);
    }

    randomizeTurn(): PlayerType {
        return Math.random() < Constants.HALF ? PlayerType.Local : PlayerType.Virtual;
    }
}
