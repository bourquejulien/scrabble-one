import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Message } from '@app/classes/message';
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
    @ViewChild('messageContainer') messageContainer: ElementRef;
    messages: Message[] = [];
    subscription: Subscription; // Subscription to messages from MessagingService
    inputValue: string; // Value of the input field so that we can use the "x" to erase the content

    constructor(private commandsService: CommandsService, public messagingService: MessagingService) {
        this.subscription = this.messagingService.onMessage().subscribe((message) => {
            // Actions when a new message is received:
            this.messages.push(message);
            // We scroll to the end!
            this.scroll();
        });
    }

    send(input: string): void {
        // When the command contains no errors, we clear the input field.
        // This gives the chance to the user to correct the syntax if there are mistakes
        if (this.commandsService.parseInput(input)) {
            this.inputValue = '';
        }
    }

    scroll(): void {
        if (this.messageContainer) {
            this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
        }
    }

    getMessageColor(message: Message): string {
        return message.userId === 0 ? 'aliceblue' : 'blanchealmond';
    }

    ngOnDestroy() {
        // We unsubscribe in order to avoid memory leaks
        this.subscription.unsubscribe();
    }
}
