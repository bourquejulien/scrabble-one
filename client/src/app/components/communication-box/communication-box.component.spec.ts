/* eslint-disable dot-notation */
/* eslint-disable max-classes-per-file */
import { NO_ERRORS_SCHEMA } from '@angular/compiler';
import { CUSTOM_ELEMENTS_SCHEMA, Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Message, MessageType } from '@app/classes/message';
import { PlayerType } from '@app/classes/player-type';
import { AppMaterialModule } from '@app/modules/material.module';
import { CommandsService } from '@app/services/commands/commands.service';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { CommunicationBoxComponent } from './communication-box.component';
@Injectable({
    providedIn: 'root',
})
class FakeCommandsService {
    messagingService: FakeMessagingService;
    parseInput(input: string): boolean {
        this.messagingService.send({ title: '', timestamp: Date.now(), body: input, messageType: MessageType.Error, userId: PlayerType.Local });
        return true;
    }
}
@Injectable({
    providedIn: 'root',
})
class FakeMessagingService {
    protected subject = new Subject<Message>();
    send(message: Message): void {
        this.subject.next(message);
    }
    onMessage(): Observable<Message> {
        return this.subject.asObservable();
    }
}

describe('CommunicationBoxComponent', () => {
    let component: CommunicationBoxComponent;
    let fixture: ComponentFixture<CommunicationBoxComponent>;
    let dummyMessage: Message;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommunicationBoxComponent],
            providers: [
                { provide: CommandsService, useClass: FakeCommandsService },
                { provide: MessagingService, useClass: FakeMessagingService },
            ],
            imports: [AppMaterialModule, BrowserAnimationsModule, FormsModule],
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
            timestamp: Date.now(),
        };
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not send a message when the input is empty', () => {
        expect(component.send('')).toBeFalsy();
    });

    it('should have subscribed', () => {
        expect(component['subscription']).toBeDefined();
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
