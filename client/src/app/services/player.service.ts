import { Injectable } from '@angular/core';
import { Direction } from '@app/classes/board/direction';
import { Vec2 } from '@app/classes/vec2';
import { skip } from 'rxjs/operators';
import { BoardService } from './board.service';
import { FakeGameService } from './fake-game.service';
import { ReserveService } from './reserve.service';

@Injectable({
  providedIn: 'root'
})

export class PlayerService {
  rack: string[] = [];

  constructor(private reserveService: ReserveService, private observerGameService: FakeGameService, private boardService: BoardService) {}

  boardValidation(word: string): string {
    let board: BoardService | undefined;
    if (board === undefined) {
      return 'There was a problem with board service. Try again.'
    }
    return '';
  }

  // is this function name too long
  lettersToPlaceValidation(lettersToPlace: string): string {
    for (let letter of lettersToPlace) {
      if (this.rack.indexOf(letter) === -1) {
        return 'You are not in possession of the letter you are trying to place. Cheating is bad.'
      }
    }
    return '';
  }

  updateReserve(lettersToPlace: string): string {
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

    return 'There was a problem with reserve service. Try again'
  }

  updateRack(lettersToPlace: string): void {
    for (let letter of lettersToPlace) {
      let letterIndex = this.rack.indexOf(letter);
      this.rack.splice(letterIndex, 1);
    }
  }


  placeLetters(word: string, direction: Direction, position: Vec2): string {
    //TODO: Place lettres sur le board; récupérer lettres du UIchevalet

    const boardMessage = this.boardValidation(word);

    /*
    const lettersToPlace = board.retrieveNewLetters(word, direction, position);
    const rackMessage = this.rackMessage(lettersToPlace);

    if(rackMessage !== '')
      return rackMessage;
    
    */

    if (boardMessage !== '')
      return boardMessage;

    let letters = new Array<[string, Vec2]>();
    
    letters.push([word, { x: position.x, y: position.y }]);

    const validationData = this.boardService.validateWord(letters);

    if (!validationData.isSuccess)
      return validationData.description;

    // this.updateRack(lettersToPlace);
    // this.updateReserve(lettersToPlace);
    this.completeTurn();

    return '';
  }

  exchangeLetters(lettersToExchange: string): string {
    if (this.reserveService.length < 7) {
      return 'There are not enough letters';
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

    return '';
  }

  completeTurn(): void {
    this.observerGameService.onTurn.pipe(skip(1)).subscribe(x => console.log('player ' + (Number(x) + 1) + ' has completed their turn!'));

    let isTurn = this.observerGameService.onTurn.getValue();
    this.observerGameService.onTurn.next(!isTurn);

  }
}