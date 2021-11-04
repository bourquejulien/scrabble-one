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
import { Direction, MessageType, SystemMessages, Vec2 } from '@common';

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

    it('#parseInput should call show help', () => {
        const spy = spyOn<any>(service, 'showHelp');
        service.parseInput('!aide');
        expect(spy).toHaveBeenCalled();
    });

    it('#parseInput should send a help message', () => {
        const spy = spyOn<any>(service['messagingService'], 'send');
        service['showHelp']();
        expect(spy).toHaveBeenCalledWith(SystemMessages.HelpTitle, SystemMessages.HelpMessage, MessageType.System);
    });

    it('#parseInput should toggle debugging mode', () => {
        service['messagingService'].isDebug = false;
        service.parseInput('!debug');
        expect(service['messagingService'].isDebug).toBeTrue();
        service.parseInput('!debug');
        expect(service['messagingService'].isDebug).toBeFalse();
    });

    it('#parseInput should send an error message when exchange letter command is invalid', () => {
        const spy = spyOn<any>(service['messagingService'], 'send');
        service.parseInput('!échanger 12345678');
        expect(spy).toHaveBeenCalledWith('', SystemMessages.InvalidLetters, MessageType.Error);
    });

    it('#parseInput should call skip turn', () => {
        service.parseInput('!échanger abc');
        expect(playerServiceSpy.exchangeLetters).toHaveBeenCalled();
    });

    it('#parseInput should send an error message when place command is passed an invalid word', () => {
        const spy = spyOn<any>(service['messagingService'], 'send');
        service.parseInput('!placer a9h w0rd');
        expect(spy).toHaveBeenCalledWith('', SystemMessages.InvalidWord, MessageType.Error);
    });

    it('#parseInput should send an error message when place command is passed invalid options', () => {
        const spy = spyOn<any>(service['messagingService'], 'send');
        service.parseInput('!placer a19h word');
        expect(spy).toHaveBeenCalledWith('', SystemMessages.InvalidOptions, MessageType.Error);
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
        const spy = spyOn<any>(service['messagingService'], 'send');
        service.parseInput(userMessage);
        expect(spy).toHaveBeenCalledWith(SystemMessages.InvalidFormat, SystemMessages.InvalidUserMessage, MessageType.Error);
    });

    it('#parseInput send a message to the other user', () => {
        let input = 'This is a message.';
        const spy = spyOn<any>(service['messagingService'], 'send');
        service.parseInput(input);
        expect(spy).toHaveBeenCalledWith('', input, MessageType.Message);
    });

    it('#parseInput should send an error message if the command is not recognized', () => {
        const spy = spyOn<any>(service['messagingService'], 'send');
        service.parseInput('!notavalidcommand');
        expect(spy).toHaveBeenCalledWith('', SystemMessages.InvalidCommand, MessageType.Error);
        expect(service.parseInput('!notavalidcommand')).toBe(false);
    });

    it('#parseInput should call skip turn', () => {
        service.parseInput('!passer');
        expect(playerServiceSpy.skipTurn).toHaveBeenCalled();
    });

    it("#parseInput should fail when it is not the user's turn", () => {
        const spy = spyOn<any>(service, 'skipTurn');
        service['gameService'].currentTurn = PlayerType.Virtual;
        service.parseInput('!passer');
        expect(spy).toHaveBeenCalled();
    });

    it('#parseInput should call displayReserve', () => {
        service.parseInput('!réserve');
        expect(reserveServiceSpy.getLetterAndQuantity).toHaveBeenCalled();
    });

    it("should fail when it is not the user's turn", () => {
        spyOn<any>(service, 'isUsersTurn').and.returnValue(false);
        expect(service['checkPlaceCommand']('h8h', 'test')).toBe(false);
    });

    it('should not excahnge letters if not users turn', () => {
        spyOn<any>(service, 'isUsersTurn').and.returnValue(false);
        expect(service['exchangeLetters']('z')).toBe(false);
    });

    it('should not skip turn if not users turn', () => {
        spyOn<any>(service, 'isUsersTurn').and.returnValue(false);
        expect(service['skipTurn']()).toBe(false);
    });

    it('should skip turn if users turn', () => {
        spyOn<any>(service, 'isUsersTurn').and.returnValue(true);
        expect(service['skipTurn']()).toBe(true);
    });

    it('should send error message if trying to skip when not turn', () => {
        service['gameService'].currentTurn = PlayerType.Virtual;
        expect(service['isUsersTurn']()).toBe(false);
    });

    it('should remove accents', () => {
        const accentedMessage = 'Ôde à la crème brûlée';
        const resultMessage = 'Ode a la creme brulee';
        expect(service['removeAccents'](accentedMessage)).toEqual(resultMessage);
    });
});
