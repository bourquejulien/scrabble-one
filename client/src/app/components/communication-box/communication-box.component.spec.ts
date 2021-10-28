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
import { PlayerType } from '@app/classes/player/player-type';
import { TimeSpan } from '@app/classes/time/timespan';
import { Constants } from '@app/constants/global.constants';
import { AppMaterialModule } from '@app/modules/material.module';
import { CommandsService } from '@app/services/commands/commands.service';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { SessionService } from '@app/services/session/session.service';
import { Message, MessageType } from '@common';
import { CommunicationBoxComponent } from './communication-box.component';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GameType } from '@app/classes/game-type';
import { SocketClientMock } from '@app/classes/serverside-socket-helper';

describe('CommunicationBoxComponent', () => {
    let component: CommunicationBoxComponent;
    let fixture: ComponentFixture<CommunicationBoxComponent>;
    let dummyMessage: Message;
    let messagingServiceSpy: jasmine.SpyObj<MessagingService>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketClientService>;
    const socketClient: SocketClientMock = new SocketClientMock();
    const commandsServiceSpy = jasmine.createSpyObj('CommandsService', {
        parseInput: (input: string) => {
            if (input === 'false') {
                return false;
            } else {
                return true;
            }
        },
    });

    const sessionService = {
        gameConfig: {
            gameType: GameType.Solo,
            playTime: TimeSpan.fromMinutesSeconds(1, 0),
            firstPlayerName: 'Alphonse',
            secondPlayerName: 'Lucienne',
        },
    };

    beforeEach(async () => {
        messagingServiceSpy = jasmine.createSpyObj('MessagingService', ['onMessage']);
        socketServiceSpyObj = jasmine.createSpyObj('SocketClientService', [], { socketClient });
        await TestBed.configureTestingModule({
            declarations: [CommunicationBoxComponent],
            providers: [
                { provide: MessagingService, useValue: messagingServiceSpy },
                { provide: SocketClientService, useValue: socketServiceSpyObj },
                { provide: CommandsService, useValue: commandsServiceSpy },
                { provide: SessionService, useValue: sessionService },
                { provide: CommandsService, useValue: jasmine.createSpyObj('CommandsService', { parseInput: true }) },
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
            userId: PlayerType.Virtual,
        };
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not send a message when the input is empty', () => {
        expect(component.send('')).toBeFalsy();
    });

    it('should return true when the input is not empty', () => {
        expect(component.send('Message.')).toBeTruthy();
    });

    /* TODO: it('should not clear input if input is not value', () => {
        const inputValue = 'some random input';
        component.inputValue = inputValue;
        component.send('false');
        expect(component.inputValue).toBe(inputValue);
    }); */

    it('should return the title of the message', () => {
        expect(component.getTitle(dummyMessage)).toBe(dummyMessage.title);
    });

    it('should return the correct title', () => {
        const firstPlayerName = 'Alberto';
        const secondPlayerName = 'Monique';
        component['sessionService']['gameConfig']['firstPlayerName'] = firstPlayerName;
        component['sessionService']['gameConfig']['secondPlayerName'] = secondPlayerName;
        expect(component.getTitle(dummyMessage)).toBe(dummyMessage.title);
        dummyMessage.messageType = MessageType.Message;
        dummyMessage.userId = PlayerType.Local;
        expect(component.getTitle(dummyMessage)).toEqual(firstPlayerName);
        dummyMessage.userId = PlayerType.Virtual;
        expect(component.getTitle(dummyMessage)).toEqual(secondPlayerName);
    });

    it("should not show the other user's system messages", () => {
        expect(component.shouldDisplay(dummyMessage)).toBeFalsy();
    });

    it('should differentiate error messages', () => {
        expect(component.isError(dummyMessage)).toBeTrue();
    });

    it('should return the correct CSS colors', () => {
        expect(component.getMessageColor(dummyMessage)).toBe(Constants.SYSTEM_COLOR);
        dummyMessage.messageType = MessageType.Message;
        dummyMessage.userId = PlayerType.Virtual;
        expect(component.getMessageColor(dummyMessage)).toBe(Constants.PLAYER_TWO_COLOR);
        dummyMessage.userId = PlayerType.Local;
        expect(component.getMessageColor(dummyMessage)).toBe(Constants.PLAYER_ONE_COLOR);
    });

    it('should push new messages and call scroll', () => {
        // Configure asynchronous event handling
        component.ngAfterViewInit();

        const scrollSpy = spyOn<any>(component, 'scroll').and.callThrough();
        const pushSpy = spyOn(component.messages, 'push').and.callThrough();

        socketClient.serverSideEmit('message', dummyMessage);

        expect(scrollSpy).toHaveBeenCalled();
        expect(pushSpy).toHaveBeenCalled();
    });

    it('should push an error message when the socket server is not available', () => {
        // Configure asynchronous event handling
        component.ngAfterViewInit();

        const pushSpy = spyOn(component.messages, 'push').and.callThrough();

        socketClient.serverSideEmit('connect_error', 'error');

        expect(pushSpy).toHaveBeenCalled();
    });

    afterAll(() => cleanStyles());
});
