import { Injectable } from '@angular/core';
import { Direction } from '@app/classes/board/direction';
import { Vec2 } from '@app/classes/vec2';
import { BoardService } from '@app/services/board/board.service';
import { GameService } from '@app/services/game/game.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { skip } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    rack: string[] = [];
    rackUpdated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    constructor(private reserveService: ReserveService, private gameService: GameService, private boardService: BoardService) {
        const initNbTiles = 7;

        for (let tile = 0; tile < initNbTiles; tile++) {
            this.rack.push(this.reserveService.drawLetter());
        }
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
            if (letterIndex === -1) return;
            this.rack.splice(letterIndex, 1);
        }
        this.rackUpdated.next(!this.rackUpdated.getValue());
    }

    placeLetters(word: string, position: Vec2, direction: Direction): string {
        const lettersToPlace = this.boardService.retrieveNewLetters(word, position, direction);
        const rackMessage = this.checkIfLettersInRack(word);
        if (rackMessage !== '') return rackMessage;

        const validationData = this.boardService.lookupLetters(lettersToPlace);

        if (!validationData.isSuccess) return validationData.description;

        this.updateRack(word);
        this.updateReserve(word);

        this.boardService.placeLetters(lettersToPlace);

        this.completeTurn();

        return '';
    }

    exchangeLetters(lettersToExchange: string): string {
        const minLettersInReserve = 7;
        const lettersToExchangeLength = lettersToExchange.length;
        const rackMessage = this.checkIfLettersInRack(lettersToExchange);

        if (rackMessage !== '') return rackMessage;

        if (this.reserveService.length < minLettersInReserve) {
            return 'There are not enough letters in the reserve. You may not use this command.';
        }

        for (let i = 0; i < lettersToExchangeLength; i++) {
            this.rack.push(this.reserveService.drawLetter());
        }

        // we forgot to add update rack here
        for (const letter of lettersToExchange) {
            this.reserveService.putBackLetter(letter);
        }
        this.updateRack(lettersToExchange);
        this.completeTurn();

        return '';
    }

    completeTurn(): void {
        this.gameService.onTurn.pipe(skip(1)).subscribe();
        const isTurn = this.gameService.onTurn.getValue();
        this.gameService.onTurn.next(!isTurn);
    }

    // For testing
    setRack(mockRack: string[]): void {
        this.rack = [];

        for (const letter of mockRack) {
            this.rack.push(letter);
        }
    }

    // For testing
    get length(): number {
        return this.rack.length;
    }
}
