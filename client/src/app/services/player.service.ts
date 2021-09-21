import { Injectable } from '@angular/core';
// import { Direction } from '@app/classes/board/direction';
// import { Vec2 } from '@app/classes/vec2';
// import { skip } from 'rxjs/operators';
import { BoardService } from '@app/services/board/board.service';
// import { GameService } from './game.service';
import { ReserveService } from './reserve/reserve.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    rack: string[] = [];

    constructor(private reserveService: ReserveService /* private gameService: GameService, private boardService: BoardService*/) {}

    boardValidation(): string {
        let board: BoardService | undefined;
        if (board === undefined) {
            return 'There was a problem with board service. Try again.';
        }
        return '';
    }

    checkIfLettersInRack(lettersToPlace: string): string {
        for (const letter of lettersToPlace) {
            if (this.rack.indexOf(letter) === -1) {
                return 'You are not in possession of the letter ' + letter + '. Cheating is bad.';
            }
        }
        return '';
    }

    updateReserve(lettersToPlace: string): string {
        const reserveLength = this.reserveService.length;
        const lettersToPlaceLength = lettersToPlace.length;

        if (this.reserveService.length === 0) return 'The reserve is empty. You cannot draw any letters.';

        if (this.reserveService.length <= lettersToPlace.length) {
            for (let i = 0; i < reserveLength; i++) {
                this.rack.push(this.reserveService.drawLetter());
            }
            return 'The reserve is now empty. You cannot draw any more letters.';
        }

        if (this.reserveService.length > lettersToPlace.length) {
            for (let i = 0; i < lettersToPlaceLength; i++) {
                this.rack.push(this.reserveService.drawLetter());
            }
            return '';
        }

        return 'There was a problem with reserve service. Try again.';
    }

    updateRack(lettersToPlace: string): void {
        for (const letter of lettersToPlace) {
            const letterIndex = this.rack.indexOf(letter);
            this.rack.splice(letterIndex, 1);
        }
    }

    placeLetters(/* word: string, position: Vec2, direction: Direction*/): string {
        const boardMessage = this.boardValidation();
        if (boardMessage !== '') return boardMessage;

        /*
const lettersToPlace = board.retrieveNewLetters(word, position, direction);
const rackMessage = this.checkIfLettersInRack(lettersToPlace);
if(rackMessage !== '')
return rackMessage;

const validationData = this.boardService.validateWord(lettersToPlace);

if (!validationData.isSuccess)
return validationData.description;

this.updateRack(lettersToPlace);
this.updateReserve(lettersToPlace);
*/

        this.completeTurn();

        return '';
    }

    exchangeLetters(lettersToExchange: string): string {
        const minLettersInReserve = 7;
        const lettersToExchangeLength = lettersToExchange.length;

        // call checkifletterinrack to make sure player exchanges letters that are in their possession.

        if (this.reserveService.length < minLettersInReserve) {
            return 'There are not enough letters in the reserve. You may not use this command.';
        }

        for (let i = 0; i < lettersToExchangeLength; i++) {
            this.rack.push(this.reserveService.drawLetter());
        }

        for (const letter of lettersToExchange) {
            this.reserveService.putBackLetter(letter);
        }

        this.completeTurn();

        return '';
    }

    completeTurn(): void {
        // this.gameService.onTurn.pipe(skip(1)).subscribe(x => console.log('player ' + (Number(x) + 1) + ' has completed their turn!'));
        // let isTurn = this.gameService.onTurn.getValue();
        // this.gameService.onTurn.next(!isTurn);
    }
}
