import { Component, ElementRef, ViewChild } from '@angular/core';
import { Constants } from '@app/constants/global.constants';
import { CommandsService } from '@app/services/commands/commands.service';
import { SessionService } from '@app/services/session/session.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Message, MessageType } from '@common';

@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss'],
})
export class CommunicationBoxComponent {
    @ViewChild('messageContainer') private messageContainer: ElementRef<HTMLDivElement>;
    messages: Message[];
    inputValue: string;

    constructor(
        private readonly commandsService: CommandsService,
        private readonly sessionService: SessionService,
        private readonly socket: SocketClientService,
    ) {
        this.messages = [];
        this.socket.on('message', (message: Message) => {
            this.messages.push(message);
            this.scroll();
        });
        this.socket.socketClient.on('connect_error', (err) => {
            // TODO: this is for debug
            const socketErrorMsg: Message = {
                title: 'Socket Error: Closing Connection',
                body: `${err.message}`,
                messageType: MessageType.Error,
                fromId: this.sessionService.id,
            };
            this.messages.push(socketErrorMsg);
            this.socket.socketClient.close();
        });
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
            case MessageType.Log:
            case MessageType.System:
            case MessageType.Error:
                return Constants.SYSTEM_COLOR;
            case MessageType.Message:
                return message.fromId === this.sessionService.id ? Constants.PLAYER_ONE_COLOR : Constants.PLAYER_TWO_COLOR;
            case MessageType.Command:
                return Constants.PLAYER_ONE_COLOR;
            default:
                return Constants.SYSTEM_COLOR;
        }
    }

    getFontColor(message: Message): string {
        return message.messageType === MessageType.Message ? Constants.BLACK_FONT : Constants.WHITE_FONT;
    }

    getTitle(message: Message): string {
        switch (message.messageType) {
            case MessageType.Message:
                return message.fromId === this.sessionService.id
                    ? this.sessionService.gameConfig.firstPlayerName
                    : this.sessionService.gameConfig.secondPlayerName;
            case MessageType.Command:
                return this.sessionService.gameConfig.firstPlayerName;
            default:
                return message.title;
        }
    }

    // eslint-disable-next-line no-unused-vars
    shouldDisplay(message: Message) {
        // TODO To check
        return true;
    }

    private scroll(): void {
        this.messageContainer?.nativeElement.scroll({
            top: this.messageContainer.nativeElement.scrollHeight + this.messageContainer.nativeElement.offsetHeight,
            behavior: 'smooth',
        });
    }
}
