import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Message, MessageType, PlayerType } from '@common';
import { Constants } from '@app/constants/global.constants';
import { CommandsService } from '@app/services/commands/commands.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { SessionService } from '@app/services/session/session.service';

@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss'],
})
export class CommunicationBoxComponent implements AfterViewInit {
    @ViewChild('messageContainer') private messageContainer: ElementRef<HTMLDivElement>;
    messages: Message[] = [];
    inputValue: string;

    constructor(private commandsService: CommandsService, private sessionService: SessionService, private readonly socket: SocketClientService) {}

    ngAfterViewInit(): void {
        this.socket.socketClient.on('message', (message: Message) => {
            this.messages.push(message);
            this.scroll();
        });

        this.socket.socketClient.on('connect_error', (err) => {
            // TODO: this is for debug
            const socketErrorMsg: Message = {
                title: 'Socket Error: Closing Connection',
                body: `${err.message}`,
                messageType: MessageType.Error,
                userId: PlayerType.Human,
            };
            this.messages.push(socketErrorMsg);
            this.socket.socketClient.close();
        });
    }

    send(input: string): boolean {
        if (input === '') return false;
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
            case MessageType.Error:
                return Constants.ERROR_COLOR;
            case MessageType.Log:
            case MessageType.Message:
            default:
                return message.userId === PlayerType.Human ? Constants.MY_COLOR : Constants.OTHERS_COLOR;
        }
    }

    getTitle(message: Message): string {
        switch (message.messageType) {
            case MessageType.Game:
            case MessageType.Message:
                return message.userId === PlayerType.Human
                    ? this.sessionService.gameConfig.firstPlayerName
                    : this.sessionService.gameConfig.secondPlayerName;
            default:
                return message.title;
        }
    }

    shouldDisplay(message: Message) {
        return message.userId === PlayerType.Human || (message.userId === PlayerType.Virtual && message.messageType === MessageType.Message);
    }

    private scroll(): void {
        if (this.messageContainer) {
            this.messageContainer.nativeElement.scroll({
                top: this.messageContainer.nativeElement.scrollHeight + this.messageContainer.nativeElement.offsetHeight,
                behavior: 'smooth',
            });
        }
    }
}
