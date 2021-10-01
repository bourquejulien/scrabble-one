import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Message, MessageType } from '@app/classes/message';
import { PlayerType } from '@app/classes/player-type';
import { CommandsService } from '@app/services/commands/commands.service';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-communication-box',
    templateUrl: './communication-box.component.html',
    styleUrls: ['./communication-box.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationBoxComponent implements OnDestroy, AfterViewInit, AfterContentInit {
    @ViewChild('messageContainer') private messageContainer: ElementRef<HTMLDivElement>;
    messages: Message[] = [];
    subscription: Subscription;
    inputValue: string;

    constructor(private commandsService: CommandsService, private messagingService: MessagingService) {}

    ngAfterContentInit(): void {
        this.scroll();
    }

    ngAfterViewInit(): void {
        this.subscription = this.messagingService.onMessage().subscribe((message) => {
            this.messages.push(message);
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
                return 'red';
            case MessageType.Log:
            case MessageType.Message:
            default:
                return message.userId === PlayerType.Local ? 'aliceblue' : 'blanchedalmond';
        }
    }

    getTitle(message: Message): string {
        if (message.messageType === MessageType.Message) {
            return 'Utilisateur ' + message.userId;
        } else {
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
                top: this.messageContainer.nativeElement.scrollHeight,
                behavior: 'smooth',
            });
        }
    }
}
