import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
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
export class CommunicationBoxComponent implements OnDestroy {
    @ViewChild('messageContainer', { static: false }) private messageContainer: ElementRef<HTMLDivElement>;
    messages: Message[] = [];
    subscription: Subscription; // Subscription to messages from MessagingService
    inputValue: string; // Value of the input field so that we can use the "x" to erase the content

    constructor(private commandsService: CommandsService, public messagingService: MessagingService) {
        this.subscription = this.messagingService.onMessage().subscribe((message) => {
            this.messages.push(message);
            this.scroll();
        });
    }

    send(input: string): void {
        if (input === '') return;
        if (this.commandsService.parseInput(input)) {
            this.inputValue = '';
        }
    }

    scroll(): void {
        if (this.messageContainer) {
            this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
        }
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

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
