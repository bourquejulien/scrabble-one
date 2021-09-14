import { Component, Input, OnInit } from '@angular/core';
import { Message } from '@app/classes/message';
import { CommandsService } from '@app/services/commands/commands.service';
import { MessagesService } from '@app/services/messages/messages.service';
@Component({
    selector: 'app-message-box',
    templateUrl: './message-box.component.html',
    styleUrls: ['./message-box.component.scss'],
})
export class MessageBoxComponent implements OnInit {
    @Input() messages: Message[]; // buffer
    value: string; // Text input value

    constructor(private commandsService: CommandsService, private messagesService: MessagesService) {}

    ngOnInit(): void {
        this.messagesService.getMessages().subscribe((messages) => (this.messages = messages));
    }

    send(input: string): void {
        this.commandsService.parseInput(input);
    }
}
