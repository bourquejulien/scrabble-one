/* eslint-disable @typescript-eslint/naming-convention */
import { TestBed } from '@angular/core/testing';
import { FakePlayerService } from '@app/services/player/mock-player.service.spec';
import { PlayerService } from '@app/services/player/player.service';
import { CommandsService } from '@app/services/commands/commands.service';
import { Message, MessageType } from '@app/classes/message';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Direction } from '@app/classes/board/direction';
import { Vec2 } from '@app/classes/vec2';
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
            userId: 1,
            timestamp: MockMessagingService.MOCK_TIMESTAMP,
        };

        if (this.debuggingMode) {
            this.subject.next(message);
        } else {
            this.subject.next(message);
        }
    }
}
describe('CommandsService', () => {
    let service: CommandsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: PlayerService, useClass: FakePlayerService },
                { provide: MessagingService, useClass: MockMessagingService },
            ],
        });
        service = TestBed.inject(CommandsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('#parseInput should send a help message with the correct info', () => {
        const expectedMessage: Message = {
            title: "Capsule d'aide",
            body: "Vous avez appelé à l'aide",
            messageType: MessageType.Log,
            timestamp: MockMessagingService.MOCK_TIMESTAMP,
            userId: 1,
        };

        service.messagingService.onMessage().subscribe((message) => {
            expect(message).toEqual(expectedMessage);
        });
        service.parseInput('!aide');
    });

    it('#parseInput should toggle debugging mode', () => {
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

    it('#parseInput should call exchange le message when exchange letter command is invalid', () => {
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
        // For test purposes
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
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

    it('#parseInputsend should call skip turn', () => {
        const spy = spyOn(service.playerService, 'completeTurn');
        service.parseInput('!passer');
        expect(spy).toHaveBeenCalled();
    });
});
