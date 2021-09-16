import { Injectable } from '@angular/core';
import { FakeGameService } from './fake-game.service';
import { ReserveService } from './reserve.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  rack: string[] = [];
  //in constructor: private boardService: BoardService
  constructor(private reserveService: ReserveService, private observerGameService: FakeGameService) {}

  placeLetters(lettersToPlace: string[]): boolean {
    //TODO: Place lettres sur le board; récupérer lettres du UIchevalet

    // Empty reserve
    if (this.reserveService.getLength() === 0)
      return false;

    // Less letters in reserve than letters placed
    if (this.reserveService.getLength() <= lettersToPlace.length) {
      for (let i = 0; i < this.reserveService.getLength(); i++) {
        this.rack.push(this.reserveService.drawLetter());
      }
      return true;
    }

    // More letters in reserve than letters placed
    if (this.reserveService.getLength() <= lettersToPlace.length) {
      for (let i = 0; i < lettersToPlace.length; i++) {
        this.rack.push(this.reserveService.drawLetter());
      }
      return true;
    }

    return false;
  }

  exchangeLetters(lettersToExchange: string[]): boolean {
    if (this.reserveService.getLength() < 7) {
      return false;
    }

    // Premièrement, le nombre de lettres demandées est pigé au hasard dans la réserve.
    for (let _ of lettersToExchange) {
      this.rack.push(this.reserveService.drawLetter());
    }

    // Ensuite, les lettres à rejeter sont remises à la réserve. 
    for (let letter of lettersToExchange) {
      this.reserveService.putBackLetter(letter);
    }

    return true;
  }

  skipTurn(): boolean {
    //TODO: figure out back and fort between player 1 and player 2
    this.observerGameService.onTurn.subscribe({
      next(x) { console.log('player' + x + 'has ended his turn'); },
      error(err) { console.error('something wrong occurred: ' + err); },
      complete() { console.log('done'); }
    });
    return false;
  }

}