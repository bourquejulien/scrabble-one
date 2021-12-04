import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Constants } from '@app/constants/global.constants';
import { CommandsService } from '@app/services/commands/commands.service';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { SessionService } from '@app/services/session/session.service';
import { Message, MessageType } from '@common';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss'],
})
export class CommunicationBoxComponent implements OnInit, OnDestroy {
    @ViewChild('messageContainer') private messageContainer: ElementRef<HTMLDivElement>;
    messages: Message[];
    inputValue: string;

    private messageSubscription: Subscription;

    constructor(
        private readonly commandsService: CommandsService,
        private readonly sessionService: SessionService,
        private readonly messagingService: MessagingService,
    ) {
        this.messages = [];
    }

    ngOnInit() {
        this.messageSubscription = this.messagingService.onMessage.subscribe((message: Message) => this.onMessage(message));
    }

    ngOnDestroy() {
        this.messageSubscription.unsubscribe();
    }

    send(input: string): boolean {
        if (input === '') {
            return false;
        }
        if (this.commandsService.parseInput(input)) {
            this.inputValue = '';
        }
        return true;
    }

    isError(message: Message): boolean {
        return message.messageType === MessageType.Error;
    }

    getMessageColor(message: Message): string {
        switch (message.messageType) {
            case MessageType.Message:
                return message.fromId === this.sessionService.id ? Constants.PLAYER_ONE_COLOR : Constants.PLAYER_TWO_COLOR;
            case MessageType.RemoteMessage:
                return Constants.PLAYER_TWO_COLOR;
            case MessageType.Command:
                return Constants.PLAYER_ONE_COLOR;
            default:
                return Constants.SYSTEM_COLOR;
        }
    }

    getTitle(message: Message): string {
        switch (message.messageType) {
            case MessageType.Message:
                return message.fromId === this.sessionService.id
                    ? this.sessionService.gameConfig.firstPlayerName
                    : this.sessionService.gameConfig.secondPlayerName;
            case MessageType.Command:
                return this.sessionService.gameConfig.firstPlayerName;
            case MessageType.RemoteMessage:
                return this.sessionService.gameConfig.secondPlayerName;
            default:
                return message.title;
        }
    }

    scroll(): void {
        this.messageContainer?.nativeElement.scroll({
            top: this.messageContainer.nativeElement.scrollHeight + this.messageContainer.nativeElement.offsetHeight,
            behavior: 'smooth',
        });
    }

    private onMessage(message: Message) {
        if (message.messageType === MessageType.Log && !this.messagingService.isDebug) {
            return;
        }
        this.messages.push(message);
    }
}
