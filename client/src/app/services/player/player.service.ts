import { Injectable } from '@angular/core';
import { Direction } from '@app/classes/board/direction';
import { PlayerType } from '@app/classes/player-type';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { TimerService } from '@app/services/timer-service/timer.service';
import { TimeSpan } from '@app/classes/time/timespan';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    rack: string[] = [];
    turnComplete: Subject<PlayerType>;
    rackUpdated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    constructor(
        private readonly reserveService: ReserveService,
        private readonly boardService: BoardService,
        private readonly timerService: TimerService,
    ) {
        this.turnComplete = new Subject<PlayerType>();
        this.timerService.countdownStopped.subscribe(() => {
            if (PlayerType.Local) this.completeTurn();
        });
    }

    startTurn(playTime: TimeSpan) {
        this.timerService.start(playTime, PlayerType.Local);
    }

    placeLetters(word: string, position: Vec2, direction: Direction): string {
        const positionToPlace = this.boardService.retrieveNewLetters(word, position, direction);
        const lettersToPlace = positionToPlace.map((e) => e.letter).join('');

        const rackMessage = this.checkIfLettersInRack(lettersToPlace);
        if (rackMessage !== '') return rackMessage;

        const validationData = this.boardService.lookupLetters(positionToPlace);

        if (!validationData.isSuccess) return validationData.description;

        this.updateRack(lettersToPlace);
        this.updateReserve(positionToPlace.length);
        this.rackUpdated.next(!this.rackUpdated.getValue());

        this.boardService.placeLetters(positionToPlace);

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
        this.turnComplete.next(PlayerType.Local);
    }

    updateReserve(lettersToPlaceLength: number): string {
        const reserveLength = this.reserveService.length;
        const rackPlaceLimit = Constants.reserve.SIZE - this.rack.length;

        if (this.reserveService.length === 0) return 'The reserve is empty. You cannot draw any letters.';

        if (lettersToPlaceLength > rackPlaceLimit) {
            lettersToPlaceLength = rackPlaceLimit;
        }

        if (reserveLength <= lettersToPlaceLength) {
            for (let i = 0; i < reserveLength; i++) {
                this.rack.push(this.reserveService.drawLetter());
            }
            return 'The reserve is now empty. You cannot draw any more letters.';
        } else {
            for (let i = 0; i < lettersToPlaceLength; i++) {
                this.rack.push(this.reserveService.drawLetter());
            }
            return '';
        }
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

    private updateRack(lettersToPlace: string): void {
        for (const letter of lettersToPlace) {
            const letterIndex = this.rack.indexOf(letter);
            if (letterIndex === -1) return;
            this.rack.splice(letterIndex, 1);
        }
    }

    private isCapitalLetter(letter: string): boolean {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return letter.charCodeAt(0) >= 65 && letter.charCodeAt(0) <= 90;
    }

    private checkIfLettersInRack(lettersToPlace: string): string {
        for (let letter of lettersToPlace) {
            if (this.isCapitalLetter(letter)) {
                letter = '*';
            }
            if (this.rack.indexOf(letter) === -1) {
                return 'You are not in possession of the letter ' + letter + '. Cheating is bad.';
            }
        }
        return '';
    }
}
