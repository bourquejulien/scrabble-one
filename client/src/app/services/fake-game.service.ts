import { Injectable } from '@angular/core';
//import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FakeGameService {
  constructor() {}

  onTurn = new BehaviorSubject<boolean>(false);

  randomizeTurn(): boolean {
    let turn =  Math.random() < 0.5;
    this.onTurn.next(turn);
    return false;
  }
  
}
