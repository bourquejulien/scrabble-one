/* eslint-disable dot-notation */
/* eslint-disable max-classes-per-file */
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/compiler';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Message, MessageType } from '@app/classes/message';
import { PlayerType } from '@app/classes/player-type';
import { AppMaterialModule } from '@app/modules/material.module';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { Subject } from 'rxjs';
import { CommunicationBoxComponent } from './communication-box.component';

fdescribe('CommunicationBoxComponent', () => {
    let component: CommunicationBoxComponent;
    let fixture: ComponentFixture<CommunicationBoxComponent>;
    let dummyMessage: Message;
    let messagingServiceSpy: jasmine.SpyObj<MessagingService>;

    beforeEach(async () => {
        messagingServiceSpy = jasmine.createSpyObj('MessagingService', ['subject', 'onMessage']);
        messagingServiceSpy['subject'] = new Subject<Message>();
        messagingServiceSpy.onMessage.and.returnValue(messagingServiceSpy['subject'].asObservable());

        await TestBed.configureTestingModule({
            declarations: [CommunicationBoxComponent],
            providers: [{ provide: MessagingService, useValue: messagingServiceSpy }],
            imports: [AppMaterialModule, BrowserAnimationsModule, FormsModule, HttpClientModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationBoxComponent);
        component = fixture.componentInstance;
        component['messagingService'] = messagingServiceSpy;
        fixture.detectChanges();

        dummyMessage = {
            title: 'Title',
            body: 'Body',
            messageType: MessageType.Error,
            userId: PlayerType.Virtual,
            timestamp: Date.now(),
        };
    });


    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not send a message when the input is empty', () => {
        expect(component.send('')).toBeFalsy();
    });

    it('should return true when the input is not empty', () => {
        spyOn(component['commandsService'], 'parseInput').and.returnValue(true);
        expect(component.send('Message.')).toBeTruthy();
    });

    it('should have subscribed', () => {
        expect(component['subscription']).toBeDefined();
    });

    it('should push a message into the array', () => {
        component['messagingService'].onMessage().subscribe(() => {
            expect(component['messages'].length).toBe(1);
        });
        component['messagingService']['subject'].next(dummyMessage);
    });

    it('should scroll when receiving new message', () => {
        expect(component['messagingService']).toBeDefined();
    });

    it('should return the title of the message', () => {
        expect(component.getTitle(dummyMessage)).toBe(dummyMessage.title);
    });

    it('should return the correct title', () => {
        expect(component.getTitle(dummyMessage)).toBe(dummyMessage.title);
        dummyMessage.messageType = MessageType.Message;
        expect(component.getTitle(dummyMessage)).toBe('Utilisateur ' + dummyMessage.userId);
    });

    it("should not show the other user's system messages", () => {
        expect(component.shouldDisplay(dummyMessage)).toBeFalsy();
    });

    it('should differentiate error messages', () => {
        expect(component.isError(dummyMessage)).toBeTrue();
    });

    it('should differentiate error messages', () => {
        expect(component.isError(dummyMessage)).toBeTrue();
    });

    it('should return the correct CSS colors', () => {
        expect(component.getMessageColor(dummyMessage)).toBe('red');
        dummyMessage.messageType = MessageType.Message;
        expect(component.getMessageColor(dummyMessage)).toBe('blanchedalmond');
        dummyMessage.userId = PlayerType.Local;
        expect(component.getMessageColor(dummyMessage)).toBe('aliceblue');
    });
});
