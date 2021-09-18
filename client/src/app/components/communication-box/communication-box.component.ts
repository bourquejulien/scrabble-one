import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
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
    messages: Message[] = [];
    subscription: Subscription;
    inputValue: string; // Value of the input field so that we can use the "x" to erase the content

    constructor(private commandsService: CommandsService, public messagingService: MessagingService) {
        this.subscription = this.messagingService.onMessage().subscribe((message) => {
            this.messages.push(message);
        });
    }

    send(input: string): void {
        this.commandsService.parseInput(input);
    }

    ngOnDestroy() {
        // We unsubscribe in order to avoid memory leaks
        this.subscription.unsubscribe();
    }
}
