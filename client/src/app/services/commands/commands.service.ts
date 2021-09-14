import { Injectable } from '@angular/core';
import { MessageType } from '@app/classes/message';
import { MessagesService } from '@app/services/messages/messages.service';

@Injectable({
    providedIn: 'root',
})
export class CommandsService {
    // TODO: create dependency to the reserve service
    // TODO: create dependency to messages

    readonly placeWordCommandRegex: string = '/([a-o])([1-15])([hv])/$';
    readonly wordRegex: string = '^[a-zA-Z]{0-15}$/'; // At least one letter
    readonly messageRegex: string = '^[a-zA-Z0-9 ].$'; // TODO: read the project prompt

    constructor(public messagesService: MessagesService) {} // TODO: Inject: Messages + User

    /**
     * Parse the user' input and call the relevant functions
     *
     * @param input the user's input
     */
    parseInput(input: string): void {
        // If the input starts with an exclamation mark it is considered as a command
        const args = input.split(' ');
        switch (args[0]) {
            case '!aide': {
                this.messagesService.sendMessage({
                    body: '!aide',
                    messageType: MessageType.Log,
                    userId: 1,
                    timestamp: Date.now(),
                });
                break;
            }
            case '!placer': {
                // Format: <row><column><word direction><space><word to be placed>
                const command = args[1].match(this.placeWordCommandRegex); // TODO: what if null?
                if (command && command[1]) {
                    command[1].match(this.placeWordCommandRegex);
                }
                // TODO: how are errors sent to the message box dialog
                break;
            }
            case '!reserver': {
                this.messagesService.sendMessage({
                    body: `!reserver ${input}`,
                    messageType: MessageType.Log,
                    userId: 1,
                    timestamp: Date.now(),
                });
                break;
            }
            case '!debug': {
                this.messagesService.sendMessage({
                    body: this.messagesService.debuggingMode ? 'Affichages de débogages activés' : 'Affichages de débogages désactivés',
                    messageType: MessageType.Log,
                    userId: 1,
                    timestamp: Date.now(),
                });
                this.messagesService.debuggingMode = !this.messagesService.debuggingMode;
                break;
            }
            // If not a command, it is probably a message
            default: {
                if (input.match(this.messageRegex)) {
                    // TODO: send message
                    this.messagesService.sendMessage({
                        body: 'MessageBoxComponent ngOnInit Called',
                        messageType: MessageType.Log,
                        userId: 1,
                        timestamp: Date.now(),
                    });
                } else {
                    // TODO: log error
                    this.messagesService.sendMessage({
                        body: 'La saisie est invalide!',
                        messageType: MessageType.InvalidInputError,
                        userId: 1,
                        timestamp: Date.now(),
                    });
                    // TODO: show pop-up
                }
                break;
            }
        }
    }

    // TODO: Swap letters (command)

    // TODO: Place letters

    // TODO: Show help menu -- Sprint 3

    // TODO: Reserve -- Sprint 2

    // TODO: Chat -- Sprint 2
}
