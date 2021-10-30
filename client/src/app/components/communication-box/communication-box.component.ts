import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { PlayerType } from '@app/classes/player/player-type';
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
                userId: PlayerType.Local,
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
            case MessageType.Log:
            case MessageType.System:
            case MessageType.Error:
                return Constants.SYSTEM_COLOR;
            case MessageType.Message:
                if (message.userId === PlayerType.Local) return Constants.PLAYER_ONE_COLOR;
                return Constants.PLAYER_TWO_COLOR;
            default:
                return Constants.SYSTEM_COLOR;
        }
    }

    getFontColor(message: Message): string {
        switch (message.messageType) {
            case MessageType.Message:
            case MessageType.System:
            case MessageType.Error:
                return Constants.WHITE_FONT;
            default:
                return Constants.BLACK_FONT;
        }
    }

    getTitle(message: Message): string {
        switch (message.messageType) {
            case MessageType.Message:
                return message.userId === PlayerType.Local
                    ? this.sessionService.gameConfig.firstPlayerName
                    : this.sessionService.gameConfig.secondPlayerName;
            default:
                return message.title;
        }
    }

    shouldDisplay(message: Message) {
        return message.userId === PlayerType.Local || (message.userId === PlayerType.Virtual && message.messageType === MessageType.Message);
    }

    private scroll(): void {
        this.messageContainer?.nativeElement.scroll({
            top: this.messageContainer.nativeElement.scrollHeight + this.messageContainer.nativeElement.offsetHeight,
            behavior: 'smooth',
        });
    }
}
