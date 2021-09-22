import { Injectable } from '@angular/core';
import { Constants } from '@app/constants/global.constants';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    time: number;
    gameType: string = Constants.gameTypesList[0];
    minutes: number = Constants.turnLengthMinutes[1];
    seconds: number = Constants.turnLengthSeconds[0];
    onTurn = new BehaviorSubject<boolean>(false);

    randomizeTurn(): boolean {
        const turn = Math.random() < Constants.half;
        this.onTurn.next(turn);
        return false;
    }
}
