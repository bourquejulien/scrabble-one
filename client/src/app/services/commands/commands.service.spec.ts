/* eslint-disable dot-notation -- Need to access private properties and functions*/
/* eslint-disable @typescript-eslint/no-magic-numbers -- Not necessary in tests*/
/* eslint-disable max-classes-per-file -- Multiple mock needed for tests*/
/* eslint-disable @typescript-eslint/naming-convention  -- Need SCREAMING_SNAKE_CASE for static property in mock class */
import { TestBed } from '@angular/core/testing';
import { Direction } from '@app/classes/board/direction';
import { CommandsService } from '@app/services/commands/commands.service';
import { GameService } from '@app/services/game/game.service';
import { PlayerService } from '@app/services/player/player.service';
import { PlayerType, Vec2 } from '@common';

describe('CommandsService', () => {
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let service: CommandsService;

    beforeEach(() => {

        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['completeTurn', 'exchangeLetters', 'placeLetters']);

        TestBed.configureTestingModule({
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: GameService, useValue: jasmine.createSpyObj('GameService', [], [{ currentTurn: PlayerType.Local }]) },
            ],
        });
        service = TestBed.inject(CommandsService);
        service.messagingService.debuggingMode = true;
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
        service.messagingService.debuggingMode = false;
        service.parseInput('!debug');
        expect(service.messagingService.debuggingMode).toBeTrue();
        service.parseInput('!debug');
        expect(service.messagingService.debuggingMode).toBeFalse();
    });

    it('#parseInput should send an error message when exchange letter command is invalid', () => {
        /* service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.Error);
        }); */
        service.parseInput('!echanger 12345678');
    });

    it('#parseInput should call skip turn', () => {
        service.parseInput('!echanger abc');
        expect(playerServiceSpy.exchangeLetters).toHaveBeenCalled();
    });

    it('#parseInput should send an error message when place command is passed an invalid word', () => {
        /* service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.Error);
        }); */
        service.parseInput('!placer a9h w0rd');
    });

    it('#parseInput should send an error message when place command is passed invalid options', () => {
        /* service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.Error);
        }); */
        service.parseInput('!placer a19h word');
    });

    it('#parseInput should call placeLetters when the input is valid', () => {
        const vecCoordinate: Vec2 = { x: 7, y: 7 };
        service.parseInput('!placer h8v word');
        expect(playerServiceSpy.placeLetters).toHaveBeenCalledWith('word', vecCoordinate, Direction.Down);
        service.parseInput('!placer h8h word');
        expect(playerServiceSpy.placeLetters).toHaveBeenCalledWith('word', vecCoordinate, Direction.Down);
    });

    it('#parseInput should send an error message if the user message is not in the right format', () => {
        const userMessage = 'A'.repeat(512 + 3);
        /* service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.Error);
        }); */
        service.parseInput(userMessage);
    });

    it('#parseInput send a message to the other user', () => {
        /* service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.Message);
        }); */
        service.parseInput('This is a message.');
    });

    it('#parseInput should send an error message if the command is not recognized', () => {
        /* service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.Error);
        }); */
        service.parseInput('!notavalidcommand');
    });

    it('#parseInput should call skip turn', () => {
        service.parseInput('!passer');
        expect(playerServiceSpy.completeTurn).toHaveBeenCalled();
    });

    it("#parseInput should fail when it is not the user's turn", () => {
        service.gameService.currentTurn = PlayerType.Virtual;
        /*service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.Error);
        });*/
        service.parseInput('!skip');
    });

    it("should fail when it is not the user's turn", () => {
        service.gameService.currentTurn = PlayerType.Virtual;
        expect(service['skipTurn']()).toBeFalsy();
        expect(service['exchangeLetters']('wtv')).toBeFalsy();
        expect(service['checkPlaceCommand']('h8h', 'test')).toBeFalsy();
    });

    it('should remove accents', () => {
        const accentedMessage = 'Ôde à la crème brûlée';
        const resultMessage = 'Ode a la creme brulee';
        expect(service['removeAccents'](accentedMessage)).toEqual(resultMessage);
    });
});
