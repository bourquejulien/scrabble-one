import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FakeGameService {

  constructor() {}

  onTurn = new Observable(
    turnValue => {
      turnValue.next(1);
      turnValue.next(2);
    });
}
