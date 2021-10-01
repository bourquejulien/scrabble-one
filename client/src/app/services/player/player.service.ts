import { Injectable } from '@angular/core';
import { Direction } from '@app/classes/board/direction';
import { MessageType } from '@app/classes/message';
import { PlayerType } from '@app/classes/player-type';
import { TimeSpan } from '@app/classes/time/timespan';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/constants/global.constants';
import { SystemMessages } from '@app/constants/system-messages.constants';
import { BoardService } from '@app/services/board/board.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { MessagingService } from '@app/services/messaging/messaging.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    points: number = 0;
    turnComplete: Subject<PlayerType>;
    rackUpdated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
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
        const positionToPlace = this.boardService.retrieveNewLetters(word, position, direction);
        const lettersToPlace = positionToPlace.map((element) => element.letter).join('');

        if (!this.checkIfLettersInRack(lettersToPlace)) return;

        const validationData = this.boardService.lookupLetters(positionToPlace);
        if (!validationData.isSuccess) {
            this.messagingService.send('', validationData.description, MessageType.Log);
            return;
        }
        this.points += validationData.points;

        this.updateRack(lettersToPlace);
        this.updateReserve(positionToPlace.length);
        this.rackUpdated.next(!this.rackUpdated.getValue());

        this.boardService.placeLetters(positionToPlace);

        this.completeTurn();
    }

    exchangeLetters(lettersToExchange: string): void {
        const lettersToExchangeLength = lettersToExchange.length;

        if (!this.checkIfLettersInRack(lettersToExchange)) return;

        if (this.reserveService.length < Constants.MIN_SIZE) {
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
        this.rackUpdated.next(!this.rackUpdated.getValue());
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

    get rackContent(): string[] {
        return this.rack;
    }

    setRack(mockRack: string[]): void {
        this.rack = [];

        for (const letter of mockRack) {
            this.rack.push(letter);
        }
    }

    private updateReserve(lettersToPlaceLength: number) {
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

    private checkIfLettersInRack(lettersToPlace: string): boolean {
        for (const letter of lettersToPlace) {
            if (this.rack.indexOf(letter) === -1) {
                this.messagingService.send(SystemMessages.ImpossibleAction, SystemMessages.LetterPossessionError + letter, MessageType.Error);
                return false;
            }
        }
        return true;
    }

    get length(): number {
        return this.rack.length;
    }
}
