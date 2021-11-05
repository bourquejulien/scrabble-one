/* eslint-disable dot-notation -- Need to access private properties and functions*/
/* eslint-disable @typescript-eslint/no-magic-numbers -- Not necessary in tests*/
/* eslint-disable max-classes-per-file -- Multiple mock needed for tests*/
/* eslint-disable @typescript-eslint/naming-convention  -- Need SCREAMING_SNAKE_CASE for static property in mock class */
import { TestBed } from '@angular/core/testing';
import { PlayerType } from '@app/classes/player/player-type';
import { CommandsService } from '@app/services/commands/commands.service';
import { GameService } from '@app/services/game/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { Direction, Vec2 } from '@common';

describe('CommandsService', () => {
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let reserveServiceSpy: jasmine.SpyObj<ReserveService>;
    let service: CommandsService;

    beforeEach(() => {
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['completeTurn', 'exchangeLetters', 'placeLetters']);
        reserveServiceSpy = jasmine.createSpyObj('ReserveService', ['getLetterAndQuantity', 'reserve']);
        reserveServiceSpy['reserve'] = ['a'];

        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['exchangeLetters', 'placeLetters', 'skipTurn']);

        TestBed.configureTestingModule({
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: GameService, useValue: jasmine.createSpyObj('GameService', [], [{ currentTurn: PlayerType.Local }]) },
                { provide: ReserveService, useValue: reserveServiceSpy },
            ],
        });
        service = TestBed.inject(CommandsService);
        service['messagingService'].isDebug = true;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#parseInput should send a help message', () => {
        /* service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.System);
        }); */
        service.parseInput('!aide');
    });

    it('#parseInput should toggle debugging mode', () => {
        service['messagingService'].isDebug = false;
        service.parseInput('!debug');
        expect(service['messagingService'].isDebug).toBeTrue();
        service.parseInput('!debug');
        expect(service['messagingService'].isDebug).toBeFalse();
    });

    it('#parseInput should send an error message when exchange letter command is invalid', () => {
        /* service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.Error);
        }); */
        service.parseInput('!échanger 12345678');
    });

    it('#parseInput should call exchange', () => {
        service['gameService'].currentTurn = PlayerType.Local;
        service.parseInput('!échanger abc');
        expect(playerServiceSpy.exchangeLetters).toHaveBeenCalled();
    });

    it('#parseInput should send an error message when place command is passed an invalid word', () => {
        // service.messagingService.onMessage().subscribe((message) => {
        //     expect(message.messageType).toEqual(MessageType.Error);
        // });
        service.parseInput('!placer a9h w0rd');
    });

    it('#parseInput should send an error message when place command is passed invalid options', () => {
        // service.messagingService.onMessage().subscribe((message) => {
        //     expect(message.messageType).toEqual(MessageType.Error);
        // });
        service.parseInput('!placer a19h word');
    });

    it('#parseInput should call placeLetters when the input is valid', () => {
        const vecCoordinate: Vec2 = { x: 7, y: 7 };
        service['gameService'].currentTurn = PlayerType.Local;
        service.parseInput('!placer h8v word');
        expect(playerServiceSpy.placeLetters).toHaveBeenCalledWith('word', vecCoordinate, Direction.Down);
        service.parseInput('!placer h8h word');
        expect(playerServiceSpy.placeLetters).toHaveBeenCalledWith('word', vecCoordinate, Direction.Down);
    });

    it('#parseInput should send an error message if the user message is not in the right format', () => {
        const userMessage = 'A'.repeat(512 + 3);
        // service.messagingService.onMessage().subscribe((message) => {
        //     expect(message.messageType).toEqual(MessageType.Error);
        // });
        service.parseInput(userMessage);
    });

    it('#parseInput send a message to the other user', () => {
        // service.messagingService.onMessage().subscribe((message) => {
        //     expect(message.messageType).toEqual(MessageType.Message);
        // });
        service.parseInput('This is a message.');
    });

    it('#parseInput should send an error message if the command is not recognized', () => {
        // service.messagingService.onMessage().subscribe((message) => {
        //     expect(message.messageType).toEqual(MessageType.Error);
        // });
        service.parseInput('!notavalidcommand');
    });

    it('parseInput should call skip turn', () => {
        service['gameService'].currentTurn = PlayerType.Local;
        service.parseInput('!passer');
        expect(playerServiceSpy.skipTurn).toHaveBeenCalled();
    });

    it("#parseInput should fail when it is not the user's turn", () => {
        service['gameService'].currentTurn = PlayerType.Virtual;
        // service.messagingService.onMessage().subscribe((message) => {
        //     expect(message.messageType).toEqual(MessageType.Error);
        // });
        service.parseInput('!skip');
    });

    it('#parseInput should call displayReserve', () => {
        service.parseInput('!réserve');
        expect(reserveServiceSpy.getLetterAndQuantity).toHaveBeenCalled();
    });

    // it("should fail when it is not the user's turn", () => {
    //     service.gameService.currentTurn = PlayerType.Virtual;
    //     expect(service['skipTurn']()).toBeFalsy();
    //     expect(service['exchangeLetters']('wtv')).toBeFalsy();
    //     expect(service['checkPlaceCommand']('h8h', 'test')).toBeFalsy();
    // });

    it('should remove accents', () => {
        const accentedMessage = 'Ôde à la crème brûlée';
        const resultMessage = 'Ode a la creme brulee';
        expect(CommandsService['removeAccents'](accentedMessage)).toEqual(resultMessage);
    });
});
