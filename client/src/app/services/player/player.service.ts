import { Injectable } from '@angular/core';
import { Direction } from '@app/classes/board/direction';
import { PlayerData } from '@app/classes/player-data';
import { TimeSpan } from '@app/classes/time/timespan';
import { Constants } from '@app/constants/global.constants';
import { SystemMessages } from '@app/constants/system-messages.constants';
import { BoardService } from '@app/services/board/board.service';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { RackService } from '@app/services/rack/rack.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { TimerService } from '@app/services/timer/timer.service';
import { MessageType, PlayerType, Vec2 } from '@common';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    turnComplete: Subject<PlayerType>;
    playerData: PlayerData = {
        score: 0,
        skippedTurns: 0,
        // TODO Not in use. remove with virtual player
        rack: [],
    };

    constructor(
        private readonly reserveService: ReserveService,
        private readonly boardService: BoardService,
        private readonly timerService: TimerService,
        private readonly messagingService: MessagingService,
        private readonly rackService: RackService,
    ) {
        this.turnComplete = new Subject<PlayerType>();
        this.timerService.countdownStopped.subscribe((playerType) => {
            if (PlayerType.Local === playerType) this.completeTurn();
        });
    }

    startTurn(playTime: TimeSpan): void {
        this.timerService.start(playTime, PlayerType.Local);
    }

    placeLetters(word: string, position: Vec2, direction: Direction): boolean {
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
            return false;
        }

        const validationData = this.boardService.lookupLetters(positionToPlace);
        if (!validationData.isSuccess) {
            this.messagingService.send('', validationData.description, MessageType.Log);
            this.completeTurn();
            return false;
        }
        this.playerData.score += validationData.points;

        this.updateRack(lettersToPlace);
        this.updateReserve(positionToPlace.length);

        this.boardService.placeLetters(positionToPlace);

        this.playerData.skippedTurns = 0;
        this.completeTurn();

        return true;
    }

    exchangeLetters(lettersToExchange: string): boolean {
        const lettersToExchangeLength = lettersToExchange.length;

        if (!this.areLettersInRack(lettersToExchange)) return false;

        if (this.reserveService.length < Constants.RACK_SIZE) {
            this.messagingService.send(SystemMessages.ImpossibleAction, SystemMessages.NotEnoughLetters, MessageType.Error);
            return false;
        }

        for (let i = 0; i < lettersToExchangeLength; i++) {
            this.rackService.rack.push(this.reserveService.drawLetter());
        }

        for (const letter of lettersToExchange) {
            this.reserveService.putBackLetter(letter);
        }

        this.updateRack(lettersToExchange);
        this.playerData.skippedTurns = 0;
        this.completeTurn();

        return true;
    }

    skipTurn(): void {
        this.playerData.skippedTurns++;
        this.completeTurn();
    }

    completeTurn(): void {
        this.turnComplete.next(PlayerType.Local);
    }

    fillRack(lengthToFill: number): void {
        for (let i = 0; i < lengthToFill; i++) {
            this.rackService.rack.push(this.reserveService.drawLetter());
        }
    }

    emptyRack(): void {
        this.rackService.empty();
    }

    setRack(mockRack: string[]): void {
        this.emptyRack();

        for (const letter of mockRack) {
            this.rackService.rack.push(letter);
        }
    }

    reset(): void {
        this.playerData.skippedTurns = 0;
        this.playerData.score = 0;
        this.emptyRack();
        this.boardService.resetBoardService();
        this.timerService.stop();
    }

    get rackContent(): string[] {
        return this.rackService.rack;
    }

    get rackLength(): number {
        return this.rackService.length;
    }

    get rack(): string[] {
        return this.rackService.rack;
    }

    private updateReserve(lettersToPlaceLength: number): void {
        const reserveLength = this.reserveService.length;

        if (this.reserveService.length === 0) {
            this.messagingService.send(SystemMessages.ImpossibleAction, SystemMessages.EmptyReserveError, MessageType.Error);
            return;
        }

        if (reserveLength <= lettersToPlaceLength) {
            for (let i = 0; i < reserveLength; i++) {
                this.rackService.rack.push(this.reserveService.drawLetter());
            }
            this.messagingService.send(SystemMessages.ImpossibleAction, SystemMessages.EmptyReserveError, MessageType.Error);
            return;
        }

        this.fillRack(lettersToPlaceLength);
    }

    private updateRack(lettersToPlace: string): void {
        for (const letter of lettersToPlace) {
            const letterIndex = this.rackService.indexOf(letter);
            if (letterIndex === -1) return;
            this.rackService.rack.splice(letterIndex, 1);
        }
    }

    private areLettersInRack(lettersToPlace: string): boolean {
        for (const letter of lettersToPlace) {
            if (this.rackService.indexOf(letter) === -1) {
                this.messagingService.send(SystemMessages.ImpossibleAction, SystemMessages.LetterPossessionError + letter, MessageType.Error);
                return false;
            }
        }
        return true;
    }
}
