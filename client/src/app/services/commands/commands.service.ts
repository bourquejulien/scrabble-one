import { Injectable } from '@angular/core';
import { MessagesService } from '@app/services/messages/messages.service';

@Injectable({
    providedIn: 'root',
})
export class CommandsService {
    // TODO: create dependency to the reserve service
    // TODO: create dependency to messages

    readonly placeWordCommandRegex: RegExp = /^([a-o]){1}([1-9]|1[0-5]){1}([hv])+$/;
    readonly wordRegex: RegExp = /^[a-zA-Z]{1,15}$/;
    readonly messageRegex: RegExp = /^[a-zA-Z0-9 [:punct:]]*$/;

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
                    body: 'Vous avez appelé aide!',
                    messageType: 'Log',
                    userId: 1,
                    timestamp: Date.now(),
                });
                break;
            }
            case '!placer': {
                // Arguments: COMMAND OPTIONS WORD
                const options = args[1].match(this.placeWordCommandRegex); // TODO: what if null?
                if (options && options[1] && args[2]) {
                    options[1].match(this.placeWordCommandRegex);
                    this.messagesService.sendMessage({
                        body: `Placé ${args[2]}`,
                        messageType: 'Log',
                        userId: 1,
                        timestamp: Date.now(),
                    });
                } else {
                    this.messagesService.sendMessage({
                        body: 'Invalide: mot non fourni ou options invalides',
                        messageType: 'Error',
                        userId: 1,
                        timestamp: Date.now(),
                    });
                }
                // TODO: how are errors sent to the message box dialog
                break;
            }
            case '!reserver': {
                const word = args[1].match(this.wordRegex);
                if (word && word[0]) {
                    this.messagesService.sendMessage({
                        body: `Mot réservé ${word[0]}`,
                        messageType: 'Log',
                        userId: 1,
                        timestamp: Date.now(),
                    });
                } else {
                    this.messagesService.sendMessage({
                        body: 'Mot invalide',
                        messageType: 'Error',
                        userId: 1,
                        timestamp: Date.now(),
                    });
                }
                break;
            }
            case '!debug': {
                this.messagesService.sendMessage({
                    body: this.messagesService.debuggingMode ? 'Affichages de débogages activés' : 'Affichages de débogages désactivés',
                    messageType: 'Log',
                    userId: 1,
                    timestamp: Date.now(),
                });
                this.messagesService.debuggingMode = !this.messagesService.debuggingMode;
                break;
            }
            // If not a command, it is probably a message
            default: {
                if (input.match(this.messageRegex)) {
                    this.messagesService.sendMessage({
                        body: `${input}`,
                        messageType: 'Log',
                        userId: 1,
                        timestamp: Date.now(),
                    });
                } else {
                    this.messagesService.sendMessage({
                        body: 'MEssage passse pas = ' + input,
                        messageType: 'Error',
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
