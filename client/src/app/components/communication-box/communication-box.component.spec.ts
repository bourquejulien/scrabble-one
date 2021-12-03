/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable max-classes-per-file */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/compiler';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { cleanStyles } from '@app/classes/helpers/cleanup.helper';
import { SocketMock } from '@app/classes/helpers/socket-test-helper';
import { PlayerType } from '@app/classes/player/player-type';
import { TimeSpan } from '@app/classes/time/timespan';
import { Constants } from '@app/constants/global.constants';
import { AppMaterialModule } from '@app/modules/material.module';
import { CommandsService } from '@app/services/commands/commands.service';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { SessionService } from '@app/services/session/session.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GameType, Message, MessageType } from '@common';
import { Subject } from 'rxjs';
import { CommunicationBoxComponent } from './communication-box.component';

describe('CommunicationBoxComponent', () => {
    let component: CommunicationBoxComponent;
    let fixture: ComponentFixture<CommunicationBoxComponent>;
    let dummyMessage: Message;
    let messagingServiceSpy: jasmine.SpyObj<MessagingService>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketClientService>;
    let commandsServiceSpy: jasmine.SpyObj<CommandsService>;
    let onMessage: Subject<Message>;
    const socketClient: SocketMock = new SocketMock();

    let sessionService = {
        id: 'local',
        gameConfig: {
            gameType: GameType.SinglePlayer,
            playTime: TimeSpan.fromMinutesSeconds(1, 0),
            firstPlayerName: 'Alphonse',
            secondPlayerName: 'Lucienne',
        },
    };

    beforeEach(async () => {
        sessionService = {
            id: 'local',
            gameConfig: {
                gameType: GameType.SinglePlayer,
                playTime: TimeSpan.fromMinutesSeconds(1, 0),
                firstPlayerName: 'Alphonse',
                secondPlayerName: 'Lucienne',
            },
        };

        onMessage = new Subject<Message>();
        messagingServiceSpy = jasmine.createSpyObj('MessagingService', [], { onMessage: onMessage.asObservable() });
        socketServiceSpyObj = jasmine.createSpyObj('SocketClientService', [], { socketClient });
        commandsServiceSpy = jasmine.createSpyObj('CommandService', ['parseInput']);

        await TestBed.configureTestingModule({
            declarations: [CommunicationBoxComponent],
            providers: [
                { provide: MessagingService, useValue: messagingServiceSpy },
                { provide: SocketClientService, useValue: socketServiceSpyObj },
                { provide: CommandsService, useValue: commandsServiceSpy },
                { provide: SessionService, useValue: sessionService },
                { provide: CommandsService, useValue: commandsServiceSpy },
            ],
            imports: [AppMaterialModule, BrowserAnimationsModule, FormsModule, HttpClientTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        dummyMessage = {
            title: 'Title',
            body: 'Body',
            messageType: MessageType.Error,
            fromId: PlayerType.Virtual,
        };
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should not send a message when the input is empty', () => {
        expect(component.send('')).toBeFalsy();
    });

    it('should return true when the input is not empty', () => {
        expect(component.send('Message.')).toBeTruthy();
    });

    it('should return the title of the message', () => {
        const testMessage = {
            title: 'Title Message Local',
            body: 'Body',
            messageType: MessageType.Message,
            fromId: PlayerType.Local,
        };
        expect(component.getTitle(testMessage)).toBe(sessionService.gameConfig.firstPlayerName);

        testMessage.fromId = PlayerType.Remote;
        expect(component.getTitle(testMessage)).toBe(sessionService.gameConfig.secondPlayerName);

        testMessage.messageType = MessageType.Command;
        expect(component.getTitle(testMessage)).toBe(sessionService.gameConfig.firstPlayerName);

        testMessage.messageType = MessageType.RemoteMessage;
        expect(component.getTitle(testMessage)).toBe(sessionService.gameConfig.secondPlayerName);

        testMessage.messageType = MessageType.Log;
        expect(component.getTitle(testMessage)).toBe(testMessage.title);
    });

    it('should not show message if debug and debug mode off', () => {
        const testMessage = {
            title: 'Title',
            body: 'Body',
            messageType: MessageType.Log,
            fromId: PlayerType.Local,
        };

        const spy = spyOn<any>(component, 'scroll');
        component['messagingService'].isDebug = false;
        component['onMessage'](testMessage);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should reset input value if parseInput successful', () => {
        commandsServiceSpy['parseInput'].and.returnValue(true);
        component.inputValue = 'a';
        component.send('!échanger e');
        expect(commandsServiceSpy['parseInput']).toHaveBeenCalled();
        expect(component.inputValue).toBe('');
    });

    it('should return the correct title', () => {
        const firstPlayerName = 'Alberto';
        const secondPlayerName = 'Monique';
        component['sessionService']['gameConfig']['firstPlayerName'] = firstPlayerName;
        component['sessionService']['gameConfig']['secondPlayerName'] = secondPlayerName;
        expect(component.getTitle(dummyMessage)).toBe(dummyMessage.title);
        dummyMessage.messageType = MessageType.Message;
        dummyMessage.fromId = 'local';
        expect(component.getTitle(dummyMessage)).toEqual(firstPlayerName);
        dummyMessage.fromId = 'remote';
        expect(component.getTitle(dummyMessage)).toEqual(secondPlayerName);
    });

    it('should differentiate error messages', () => {
        expect(component.isError(dummyMessage)).toBeTrue();
    });

    it('should return the correct CSS colors', () => {
        const testMessage = {
            title: 'Title',
            body: 'Body',
            messageType: MessageType.Message,
            fromId: PlayerType.Local,
        };
        expect(component.getMessageColor(testMessage)).toBe(Constants.PLAYER_ONE_COLOR);

        testMessage.fromId = PlayerType.Remote;
        expect(component.getMessageColor(testMessage)).toBe(Constants.PLAYER_TWO_COLOR);

        testMessage.messageType = MessageType.RemoteMessage;
        expect(component.getMessageColor(testMessage)).toBe(Constants.PLAYER_TWO_COLOR);

        testMessage.messageType = MessageType.Command;
        expect(component.getMessageColor(testMessage)).toBe(Constants.PLAYER_ONE_COLOR);

        testMessage.messageType = MessageType.System;
        expect(component.getMessageColor(dummyMessage)).toBe(Constants.SYSTEM_COLOR);
    });

    it('should push new messages and call scroll', () => {
        const scrollSpy = spyOn<any>(component, 'scroll').and.callThrough();
        const pushSpy = spyOn(component.messages, 'push').and.callThrough();

        onMessage.next(dummyMessage);

        expect(scrollSpy).toHaveBeenCalled();
        expect(pushSpy).toHaveBeenCalled();
    });

    it('should scroll down if new message pushed', () => {
        const spy = spyOn(component['messageContainer']['nativeElement'], 'scroll');
        component['scroll']();
        expect(spy).toHaveBeenCalled();
    });

    afterAll(() => cleanStyles());
});
