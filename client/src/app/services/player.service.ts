import { Injectable } from '@angular/core';
import { FakeGameService } from './fake-game.service';
import { ReserveService } from './reserve.service';
import { skip } from 'rxjs/operators';
import { Vec2 } from '@app/classes/vec2';
import { BoardService } from './board.service';
import { Direction } from '@app/classes/board/direction';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  rack: string[] = [];
  
  constructor(private reserveService: ReserveService, private observerGameService: FakeGameService, private boardService: BoardService) {}

  placeLetters(word: string, direction: Direction, position: Vec2[]): string {
    //TODO: Place lettres sur le board; récupérer lettres du UIchevalet

    /**
     * 1. send to board
     * 2. lettersToPlace = board.diff(word ou letter[]) should return string
     * 3. split letterstoplace 
     * 4. check rack 
     * 5. validationData = validation(word)
     * 6. check if !success return validationData.description
     * 7. completeTurn return ''
     * 
    **/ 
    let board: BoardService | undefined;
    if(board === undefined){
      return 'There was a problem with board service. Try again.'
    }
    /*

    const lettersToPlace = board.diff(word);
    
    */

    // Empty reserve
    if (this.reserveService.length === 0)
      return 'The reserve is empty. You cannot draw any letters.';

    // Less letters in reserve than letters placed
    if (this.reserveService.length <= lettersToPlace.length) {
      for (let i = 0; i < this.reserveService.length; i++) {
        this.rack.push(this.reserveService.drawLetter());
      }
      return 'The reserve is now empty. You cannot draw any more letters.';
    }

    // More letters in reserve than letters placed
    if (this.reserveService.length <= lettersToPlace.length) {
      for (let i = 0; i < lettersToPlace.length; i++) {
        this.rack.push(this.reserveService.drawLetter());
      }
      return '';
    }

    this.completeTurn();

    return '';
  }

  exchangeLetters(lettersToExchange: string[]): string {
    if (this.reserveService.length < 7) {
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

    this.completeTurn();

    return true;
  }

  completeTurn(): void {
    this.observerGameService.onTurn.pipe(skip(1)).subscribe(x => console.log('player ' + (Number(x) + 1) + ' has completed their turn!'));

    let isTurn = this.observerGameService.onTurn.getValue();

    this.observerGameService.onTurn.next(!isTurn);
  
  }
}