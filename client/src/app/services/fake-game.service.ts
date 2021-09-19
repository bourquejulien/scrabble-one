import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FakeGameService {
    onTurn = new BehaviorSubject<boolean>(false);

    randomizeTurn(): boolean {
        const boolInterval = 0.5;
        const turn = Math.random() < boolInterval;

        this.onTurn.next(turn);
        return false;
    }
}
