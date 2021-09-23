import { Injectable } from '@angular/core';
import { GameConfig } from '@app/classes/game-config';
import { Constants } from '@app/constants/global.constants';
import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class GameService {
    onTurn = new BehaviorSubject<boolean>(false);
    gameConfig: GameConfig = {
        gameType: Constants.gameTypesList[0],
        minutes: Constants.turnLengthMinutes[1],
        seconds: Constants.turnLengthSeconds[0],
        time: 0,
        firstPlayerName: '',
        secondPlayerName: '',
    };
    randomizeTurn(): boolean {
        const turn = Math.random() < Constants.half;
        this.onTurn.next(turn);
        return false;
    }
}
