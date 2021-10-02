import { Injectable } from '@angular/core';
import { Direction } from '@app/classes/board/direction';
import { MessageType } from '@app/classes/message';
import { PlayerType } from '@app/classes/player-type';
import { TimeSpan } from '@app/classes/time/timespan';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/constants/global.constants';
import { SystemMessages } from '@app/constants/system-messages.constants';
import { BoardService } from '@app/services/board/board.service';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    points: number = 0;
    skipTurnNb: number = 0;
    turnComplete: Subject<PlayerType>;
    rack: string[] = [];

    constructor(
        private readonly reserveService: ReserveService,
        private readonly boardService: BoardService,
        private readonly timerService: TimerService,
        private readonly messagingService: MessagingService,
    ) {
        this.turnComplete = new Subject<PlayerType>();
        this.timerService.countdownStopped.subscribe((playerType) => {
            if (PlayerType.Local === playerType) this.completeTurn();
        });
    }

    startTurn(playTime: TimeSpan): void {
        this.timerService.start(playTime, PlayerType.Local);
    }

    placeLetters(word: string, position: Vec2, direction: Direction): void {
        let starLetter = '';

        for (let letter of word) {
            if (letter.match(/^[A-Z]$/)) {
                starLetter = letter.toLowerCase();
                letter = letter.toLowerCase();
            }
        }

        const positionToPlace = this.boardService.retrieveNewLetters(word, position, direction);
        let lettersToPlace = positionToPlace.map((element) => element.letter).join('');

        if (starLetter !== '') {
            const splitLetters = lettersToPlace.split('');
            const indexOfStar = lettersToPlace.indexOf(starLetter);
            splitLetters.splice(indexOfStar, 1);
            splitLetters.splice(indexOfStar, 0, '*');
            lettersToPlace = splitLetters.join('');
        }

        if (!this.areLettersInRack(lettersToPlace)) {
            this.completeTurn();
            return;
        }

        const validationData = this.boardService.lookupLetters(positionToPlace);
        if (!validationData.isSuccess) {
            this.messagingService.send('', validationData.description, MessageType.Log);
            this.completeTurn();
            return;
        }
        this.points += validationData.points;

        this.updateRack(lettersToPlace);
        this.updateReserve(positionToPlace.length);

        this.boardService.placeLetters(positionToPlace);

        this.skipTurnNb = 0;
        this.completeTurn();
    }

    exchangeLetters(lettersToExchange: string): void {
        const lettersToExchangeLength = lettersToExchange.length;

        if (!this.areLettersInRack(lettersToExchange)) return;

        if (this.reserveService.length < Constants.RACK_SIZE) {
            this.messagingService.send(SystemMessages.ImpossibleAction, SystemMessages.NotEnoughLetters, MessageType.Error);
            return;
        }

        for (let i = 0; i < lettersToExchangeLength; i++) {
            this.rack.push(this.reserveService.drawLetter());
        }

        for (const letter of lettersToExchange) {
            this.reserveService.putBackLetter(letter);
        }

        this.updateRack(lettersToExchange);
        this.skipTurnNb = 0;
        this.completeTurn();
    }

    skipTurn(): void {
        this.skipTurnNb++;
        this.completeTurn();
    }

    completeTurn(): void {
        this.turnComplete.next(PlayerType.Local);
    }

    fillRack(lengthToFill: number): void {
        for (let i = 0; i < lengthToFill; i++) {
            this.rack.push(this.reserveService.drawLetter());
        }
    }

    emptyRack(): void {
        this.rack = [];
    }

    setRack(mockRack: string[]): void {
        this.emptyRack();

        for (const letter of mockRack) {
            this.rack.push(letter);
        }
    }

    reset() {
        this.skipTurnNb = 0;
        this.points = 0;
        this.emptyRack();
        this.boardService.resetBoardService();
        this.timerService.stop();
    }

    get rackContent(): string[] {
        return this.rack;
    }

    private updateReserve(lettersToPlaceLength: number): void {
        const reserveLength = this.reserveService.length;

        if (this.reserveService.length === 0) {
            this.messagingService.send(SystemMessages.ImpossibleAction, SystemMessages.EmptyReserveError, MessageType.Error);
            return;
        }

        if (reserveLength <= lettersToPlaceLength) {
            for (let i = 0; i < reserveLength; i++) {
                this.rack.push(this.reserveService.drawLetter());
            }
            this.messagingService.send(SystemMessages.ImpossibleAction, SystemMessages.EmptyReserveError, MessageType.Error);
            return;
        }

        this.fillRack(lettersToPlaceLength);
    }

    private updateRack(lettersToPlace: string): void {
        for (const letter of lettersToPlace) {
            const letterIndex = this.rack.indexOf(letter);
            if (letterIndex === -1) return;
            this.rack.splice(letterIndex, 1);
        }
    }

    private areLettersInRack(lettersToPlace: string): boolean {
        for (const letter of lettersToPlace) {
            if (this.rack.indexOf(letter) === -1) {
                this.messagingService.send(SystemMessages.ImpossibleAction, SystemMessages.LetterPossessionError + letter, MessageType.Error);
                return false;
            }
        }
        return true;
    }

    // For testing
    get length(): number {
        return this.rack.length;
    }
}
