import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Message, MessageType } from '@common/message';
import { PlayerType } from '@common/player-type';
import { Constants } from '@app/constants/global.constants';
import { CommandsService } from '@app/services/commands/commands.service';
import { GameService } from '@app/services/game/game.service';
import { Subscription } from 'rxjs';
import { io, Socket } from 'socket.io-client';
@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss'],
})
export class CommunicationBoxComponent implements OnDestroy, AfterViewInit {
    @ViewChild('messageContainer') private messageContainer: ElementRef<HTMLDivElement>;
    messages: Message[] = [];
    subscription: Subscription;
    inputValue: string;
    socketClient: Socket = io('http://localhost:3000/');

    constructor(private commandsService: CommandsService, private gameService: GameService) {}

    ngAfterViewInit(): void {
        this.socketClient.on('message', (message: Message) => {
            this.messages.push(message);
            this.scroll();
        });

        this.socketClient.on('connect_error', (err) => {
            const socketErrorMsg: Message = {
                title: 'Socket Error',
                body: `${err.message}`,
                messageType: MessageType.Log,
                userId: PlayerType.Local,
            };
            this.messages.push(socketErrorMsg);
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
                return message.userId === PlayerType.Local ? Constants.MY_COLOR : Constants.OTHERS_COLOR;
        }
    }

    getTitle(message: Message): string {
        switch (message.messageType) {
            case MessageType.Game:
            case MessageType.Message:
                return message.userId === PlayerType.Local
                    ? this.gameService.gameConfig.firstPlayerName
                    : this.gameService.gameConfig.secondPlayerName;
            default:
                return message.title;
        }
    }

    shouldDisplay(message: Message) {
        return message.userId === PlayerType.Local || (message.userId === PlayerType.Virtual && message.messageType === MessageType.Message);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
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
