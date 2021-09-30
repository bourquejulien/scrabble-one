/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Direction } from '@app/classes/board/direction';
import { Message, MessageType } from '@app/classes/message';
import { PlayerType } from '@app/classes/player-type';
import { Vec2 } from '@app/classes/vec2';
import { CommandsService } from '@app/services/commands/commands.service';
import { GameService } from '@app/services/game/game.service';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
class MockMessagingService extends MessagingService {
    // For test purposes
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    static MOCK_TIMESTAMP: number = 100000000;
    constuctor() {
        this.subject = new Subject<Message>();
    }

    send(title: string, body: string, messageType: MessageType) {
        const message = {
            title,
            body,
            messageType,
            userId: PlayerType.Local,
            timestamp: MockMessagingService.MOCK_TIMESTAMP,
        };

        if (this.debuggingMode) {
            this.subject.next(message);
        } else if (message.messageType === MessageType.Message) {
            this.subject.next(message);
        }
    }
}
class MockGameService {
    currentTurn = PlayerType.Local;
}
describe('CommandsService', () => {
    let service: CommandsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                // { provide: PlayerService, useClass: FakePlayerService },
                { provide: MessagingService, useClass: MockMessagingService },
                { provide: GameService, useClass: MockGameService },
            ],
        });
        service = TestBed.inject(CommandsService);
        service.messagingService.debuggingMode = true;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#parseInput should send a help message', () => {
        service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.System);
        });
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
        service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.Error);
        });
        service.parseInput('!echanger 12345678');
    });

    it('#parseInputsend should call skip turn', () => {
        const spy = spyOn(service.playerService, 'exchangeLetters');
        service.parseInput('!echanger abc');
        expect(spy).toHaveBeenCalled();
    });

    it('#parseInput should send an error message when place command is passed an invalid word', () => {
        service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.Error);
        });
        service.parseInput('!placer a9h w0rd');
    });

    it('#parseInput should send an error message when place command is passed invalid options', () => {
        service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.Error);
        });
        service.parseInput('!placer a19h word');
    });

    it('#parseInput should call placeLetters when the input is valid', () => {
        const spy = spyOn(service.playerService, 'placeLetters');
        const vecCoordinate: Vec2 = { x: 7, y: 7 };
        service.parseInput('!placer h8v word');
        expect(spy).toHaveBeenCalledWith('word', vecCoordinate, Direction.Down);
    });

    it('#parseInput should send an error message if the user message is not in the right format', () => {
        const userMessage = 'A'.repeat(512 + 3);
        service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.Error);
        });
        service.parseInput(userMessage);
    });

    it('#parseInput send a message to the other user', () => {
        service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.Message);
        });
        service.parseInput('This is a message.');
    });

    it('#parseInput should send an error message if the command is not recognized', () => {
        service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.Error);
        });
        service.parseInput('!notavalidcommand');
    });

    it('#parseInput should call skip turn', () => {
        const spy = spyOn(service.playerService, 'completeTurn');
        service.parseInput('!passer');
        expect(spy).toHaveBeenCalled();
    });

    it("#parseInput should fail when it is not the user's turn", () => {
        service.gameService.currentTurn = PlayerType.Virtual;
        service.messagingService.onMessage().subscribe((message) => {
            expect(message.messageType).toEqual(MessageType.Error);
        });
        service.parseInput('!skip');
    });

    it('should remove accents', () => {
        const accentedMessage = 'Ôde à la crème brûlée';
        const resultMessage = 'Ode a la creme brulee';
        expect(service['removeAccents'](accentedMessage)).toEqual(resultMessage);
    });
});
