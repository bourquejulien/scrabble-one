import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Message } from '@app/classes/message';
import { CommandsService } from '@app/services/commands/commands.service';
import { MessagesService } from '@app/services/messages/messages.service';
@Component({
    selector: 'app-message-box',
    templateUrl: './message-box.component.html',
    styleUrls: ['./message-box.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageBoxComponent implements OnInit {
    @Input() messages: Message[];
    value: string; // Command input value so that we can use the "x" to erase the content

    constructor(private commandsService: CommandsService, public messagesService: MessagesService) {}

    ngOnInit(): void {
        this.messagesService.getMessages().subscribe((messages) => (this.messages = messages));
    }

    send(input: string): void {
        this.commandsService.parseInput(input);
    }
}
