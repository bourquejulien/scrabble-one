import { Injectable } from '@angular/core';
import { GameConfig } from '@app/classes/game-config';
import { PlayerType } from '@app/classes/player-type';
import { Constants } from '@app/constants/global.constants';
import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class GameService {
    onTurn: BehaviorSubject<PlayerType>;
    gameConfig: GameConfig;

    startGame(gameConfig: GameConfig) {
        this.gameConfig = gameConfig;
        this.onTurn = new BehaviorSubject(this.randomizeTurn());
    }

    endGame() {

    }

    nextTurn() {
        this.onTurn?.next(this.onTurn.getValue() === PlayerType.Local ? PlayerType.Virtual : PlayerType.Local);
    }

    private randomizeTurn(): PlayerType {
        return Math.random() < Constants.HALF ? PlayerType.Local : PlayerType.Virtual;
    }
}
