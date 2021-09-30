/* eslint-disable dot-notation -- Need access to private functions and properties*/
/* eslint-disable max-classes-per-file -- Multiple stubs/mocks are used */
/* eslint-disable max-lines  -- Max lines should not be applied to tests*/
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MessageType } from '@app/classes/message';
import { PlayerType } from '@app/classes/player-type';
import { TimeSpan } from '@app/classes/time/timespan';
import { SystemMessages } from '@app/constants/system-messages.constants';
import { BoardService } from '@app/services/board/board.service';
import { MockBoardService } from '@app/services/board/mock-board.service';
import { PlayerService } from '@app/services/player/player.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Subject } from 'rxjs';

const MAX_PLAYTIME_SECONDS = 1;

@Injectable({
    providedIn: 'root',
})
class TimerServiceMock {
    readonly countdownStopped: Subject<PlayerType> = new Subject();

    gotStarted = false;
    gotStopped = false;

    start(span: TimeSpan, playerType: PlayerType) {
        expect(playerType).toEqual(PlayerType.Local);
        expect(span.seconds).toEqual(MAX_PLAYTIME_SECONDS);

        this.gotStarted = true;
    }

    reset() {
        this.gotStopped = true;
    }
}

@Injectable({
    providedIn: 'root',
})
class ReserveServiceMock {
    reserve: string[];

    constructor() {
        this.setReserve([]);
    }

    setReserve(mockReserve: string[]): void {
        this.reserve = [];

        for (const letter of mockReserve) {
            this.reserve.push(letter);
        }
    }

    drawLetter(): string {
        const randomLetterIndex = this.reserve.indexOf('a');
        return this.reserve.splice(randomLetterIndex, 1)[0];
    }

    putBackLetter(letterToExchange: string): void {
        const letterIndex = this.reserve.indexOf(letterToExchange);
        if (letterIndex !== -1) {
            this.reserve.splice(letterIndex, 0, letterToExchange);
        } else if (letterToExchange.match(/^[a-z]$/) || letterToExchange === '*') this.reserve.push(letterToExchange);
    }

    get length(): number {
        return this.reserve.length;
    }
}

fdescribe('PlayerService', () => {
    let service: PlayerService;
    let reserveService: ReserveService;
    let letterToRemoveFromRack: string;
    let invalidLetter: string;
    let lettersToPlace: string;
    let lettersToExchange: string;
    let timerServiceMock: TimerService;

    beforeEach(() => {
        letterToRemoveFromRack = 'e';
        invalidLetter = 'z';
        lettersToPlace = 'ios';
        lettersToExchange = 'kee';
        const mockRack = ['k', 'e', 's', 'e', 'i', 'o', 'v'];

        TestBed.configureTestingModule({
            providers: [
                { provide: BoardService, useClass: MockBoardService },
                { provide: ReserveService, useClass: ReserveServiceMock },
                { provide: TimerService, useClass: TimerServiceMock },
            ],
        });
        service = TestBed.inject(PlayerService);
        reserveService = TestBed.inject(ReserveService);
        timerServiceMock = TestBed.inject(TimerService);

        service.setRack(mockRack);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send error message if reserve length less than 7', () => {
        const smallReserve = ['a', 'b'];
        reserveService.setReserve(smallReserve);
        const spy = spyOn(service['messagingService'], 'send');
        service.exchangeLetters(lettersToExchange);
        expect(spy).toHaveBeenCalledWith(SystemMessages.ImpossibleAction, SystemMessages.NotEnoughLetters, MessageType.Error);
    });

    it('should send error message if reserve length less than 7', () => {
        const smallReserve = ['a', 'b'];
        reserveService.setReserve(smallReserve);
        const spy = spyOn(service['messagingService'], 'send');
        service.exchangeLetters(lettersToExchange);
        expect(spy).toHaveBeenCalledWith(SystemMessages.ImpossibleAction, SystemMessages.NotEnoughLetters, MessageType.Error);
    });

    it('should not affect rack size if reserve length bigger than 7', () => {
        const currentRackLength = service['rack'].length;
        const newReserve = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        reserveService.setReserve(newReserve);

        service.exchangeLetters(lettersToExchange);
        expect(service['rack'].length).toBe(currentRackLength);
    });

    it('should successfully remove lettersToExchange from rack if reserve length bigger than 7', () => {
        const newReserve = ['a', 'a', 'a', 'a', 'a', 'a', 'a'];
        reserveService.setReserve(newReserve);

        service.exchangeLetters(lettersToExchange);
        expect(service['rack'][0]).toBe('s');
        expect(service['rack'][1]).toBe('i');
        expect(service['rack'][2]).toBe('o');
        expect(service['rack'][3]).toBe('v');
    });

    it('should successfully add new letters to rack if reserve length bigger than 7', () => {
        const newReserve = ['a', 'a', 'a', 'a', 'a', 'a', 'a'];
        reserveService.setReserve(newReserve);

        service.exchangeLetters(lettersToExchange);
        expect(service['rack'][4]).toBe('a');
        expect(service['rack'][5]).toBe('a');
        expect(service['rack'][6]).toBe('a');
    });

    it('should successfully add lettersToExchange to reserve if reserve length bigger than 7', () => {
        const newReserve = ['a', 'a', 'a', 'a', 'a', 'a', 'a'];
        reserveService.setReserve(newReserve);

        service.exchangeLetters(lettersToExchange);
        expect(reserveService['reserve'][0]).toBe('a');
        expect(reserveService['reserve'][1]).toBe('a');
        expect(reserveService['reserve'][2]).toBe('a');
        expect(reserveService['reserve'][3]).toBe('a');
        expect(reserveService['reserve'][4]).toBe('k');
        expect(reserveService['reserve'][5]).toBe('e');
        expect(reserveService['reserve'][6]).toBe('e');
    });

    it('should change value of rack updated subject if letters successfully exchanged', () => {
        const newReserve = ['a', 'a', 'a', 'a', 'a', 'a', 'a'];
        reserveService.setReserve(newReserve);

        service.exchangeLetters(lettersToExchange);
        expect(service.rackUpdated.getValue()).toBe(false);
    });

    it('should notify player if startTurn', (done) => {
        service.turnComplete.subscribe((playerType) => {
            expect(playerType).toEqual(PlayerType.Local);
            done();
        });
        service.startTurn(TimeSpan.fromSeconds(MAX_PLAYTIME_SECONDS));
        timerServiceMock.countdownStopped.next(PlayerType.Local);
        service.turnComplete.unsubscribe();
    });

    it('should notify player change if completeTurn', (done) => {
        service.completeTurn();
        service.turnComplete.subscribe((playerType) => {
            expect(playerType).toEqual(PlayerType.Local);
            done();
        });
        timerServiceMock.countdownStopped.next(PlayerType.Local);
    });

    it('should add specified amount of letters to rack if valid number of letters to add is entered', () => {
        const amountlettersToAdd = 10;
        const currentLength = service.length;
        service.fillRack(amountlettersToAdd);
        expect(service.length).toBe(currentLength + amountlettersToAdd);
    });

    it('should not affect rack if invalid number of letters entered', () => {
        const currentLength = service.length;
        service.fillRack(-1);
        expect(service.length).toBe(currentLength);
    });

    it('should not affect position of letters already in rack if letters added', () => {
        service.fillRack(3);

        expect(service['rack'][0]).toBe('k');
        expect(service['rack'][1]).toBe('e');
        expect(service['rack'][2]).toBe('s');
        expect(service['rack'][3]).toBe('e');
        expect(service['rack'][4]).toBe('i');
        expect(service['rack'][5]).toBe('o');
        expect(service['rack'][6]).toBe('v');
    });

    it('should decrease rack length to 0 if successfully emptied', () => {
        service.emptyRack();
        expect(service.length).toBe(0);
    });

    it('should get rack content', () => {
        const content = service.rackContent;
        expect(service['rack']).toBe(content);
    });

    it('should successfully change the content of rack if new rack has same length', () => {
        const newRack = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        service.setRack(newRack);

        expect(service['rack'][0]).toBe('a');
        expect(service['rack'][1]).toBe('b');
        expect(service['rack'][2]).toBe('c');
        expect(service['rack'][3]).toBe('d');
        expect(service['rack'][4]).toBe('e');
        expect(service['rack'][5]).toBe('f');
        expect(service['rack'][6]).toBe('g');
    });

    it('should successfully change the content of rack if new rack has smaller length', () => {
        const newRack = ['a', 'b', 'c', 'd'];
        service.setRack(newRack);

        expect(service['rack'][0]).toBe('a');
        expect(service['rack'][1]).toBe('b');
        expect(service['rack'][2]).toBe('c');
        expect(service['rack'][3]).toBe('d');
    });

    it('should successfully change the content of rack if new rack has bigger length', () => {
        const newRack = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        service.setRack(newRack);

        expect(service['rack'][0]).toBe('a');
        expect(service['rack'][1]).toBe('b');
        expect(service['rack'][2]).toBe('c');
        expect(service['rack'][3]).toBe('d');
        expect(service['rack'][4]).toBe('e');
        expect(service['rack'][5]).toBe('f');
        expect(service['rack'][6]).toBe('g');
        expect(service['rack'][7]).toBe('h');
    });

    it('should successfully change the length of rack if new rack has different size', () => {
        const smallerRack = ['a', 'b', 'c', 'd'];
        service.setRack(smallerRack);
        expect(service.length).toBe(smallerRack.length);

        const biggerRack = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        service.setRack(biggerRack);
        expect(service.length).toBe(biggerRack.length);
    });

    it('should return an error message if the reserve is empty', () => {
        const newReserve: string[] = [];
        reserveService.setReserve(newReserve);
        const spy = spyOn(service['messagingService'], 'send');

        service['updateReserve'](lettersToPlace.length);
        expect(spy).toHaveBeenCalledWith(SystemMessages.ImpossibleAction, SystemMessages.EmptyReserveError, MessageType.Error);
    });

    it('should call fillRack if the reserve size is bigger than the amount of letters to place', () => {
        const newReserve: string[] = ['a', 'c', 'c', 'd', 'e', 'f', 'g', 'h', 'h'];
        reserveService.setReserve(newReserve);

        const spy = spyOn(service, 'fillRack');
        service['updateReserve'](lettersToPlace.length);
        expect(spy).toHaveBeenCalled();
    });

    it('should return an error message if the reserve size is smaller than the amount of letters to place', () => {
        const newReserve = ['a', 'b'];
        reserveService.setReserve(newReserve);

        const spy = spyOn(service['messagingService'], 'send');
        service['updateReserve'](lettersToPlace.length);
        expect(spy).toHaveBeenCalledWith(SystemMessages.ImpossibleAction, SystemMessages.EmptyReserveError, MessageType.Error);
    });

    it('should return an error message if the reserve size is equal to the amount of letters to place', () => {
        const newReserve = ['a', 'b', 'c'];
        reserveService.setReserve(newReserve);

        const spy = spyOn(service['messagingService'], 'send');
        service['updateReserve'](lettersToPlace.length);
        expect(spy).toHaveBeenCalledWith(SystemMessages.ImpossibleAction, SystemMessages.EmptyReserveError, MessageType.Error);
    });

    it('should increase rack length by lettersToPlace length if reserve length bigger than amount of letters to place', () => {
        const rackToFill = ['a', 'b', 'c', 'd'];
        service.setRack(rackToFill);

        const newReserve = ['a', 'c', 'c', 'd', 'e', 'f', 'g', 'h', 'h'];
        reserveService.setReserve(newReserve);

        service['updateReserve'](lettersToPlace.length);
        expect(service['rack'].length).toBe(rackToFill.length + lettersToPlace.length);
    });

    it('should increase rack length by reserve length if reserve length smaller than amount of letters to place', () => {
        const rackToFill = ['a', 'b', 'c', 'd'];
        service.setRack(rackToFill);

        const newReserve = ['a', 'b'];
        reserveService.setReserve(newReserve);

        service['updateReserve'](lettersToPlace.length);
        expect(service['rack'].length).toBe(rackToFill.length + newReserve.length);
    });

    it('should increase rack length by reserve length if reserve length equal to amount of letters to place', () => {
        const rackToFill = ['a', 'b', 'c', 'd'];
        service.setRack(rackToFill);

        const newReserve = ['a', 'b', 'c'];
        reserveService.setReserve(newReserve);

        service['updateReserve'](lettersToPlace.length);
        expect(service['rack'].length).toBe(rackToFill.length + newReserve.length);
    });

    it('should decrease length of rack if valid letter successfully removed from rack', () => {
        const currentLength = service.length;
        service['updateRack'](letterToRemoveFromRack);

        expect(service.length).toBe(currentLength - 1);
    });

    it('should successful remove first occurrence of valid letter of multiple occurrences from rack', () => {
        service['updateRack'](letterToRemoveFromRack);

        expect(service['rack'][1]).toBe('s');
    });

    it('should decrease length of rack if valid letter with multiple occurrences successful removed from rack', () => {
        const currentLength = service.length;
        service['updateRack'](letterToRemoveFromRack);
        service['updateRack'](letterToRemoveFromRack);

        expect(service.length).toBe(currentLength - 2);
    });

    it('should successfully remove first occurrence of valid letter from rack', () => {
        service['updateRack'](letterToRemoveFromRack);
        service['updateRack'](letterToRemoveFromRack);

        expect(service['rack'][2]).toBe('i');
    });

    it('should not affect rack if invalid letter tries to be removed', () => {
        const currentLength = service.length;
        service['updateRack'](invalidLetter);

        expect(service.length).toBe(currentLength);
    });

    it('should return an empty string if lettersToPlace are in rack ', () => {
        expect(service['areLettersInRack'](lettersToPlace)).toBeTruthy();
    });

    it('should return an error message if the letter is not in rack', () => {
        const spy = spyOn(service['messagingService'], 'send');
        service['areLettersInRack'](invalidLetter);
        expect(spy).toHaveBeenCalledWith(SystemMessages.ImpossibleAction, SystemMessages.LetterPossessionError + invalidLetter, MessageType.Error);
    });

    it('should return current size of rack', () => {
        const mockRack = ['k', 'e', 's', 'e', 'i', 'o', 'v'];
        expect(service.length).toBe(mockRack.length);
    });
});
