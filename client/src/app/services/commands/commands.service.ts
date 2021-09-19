import { Injectable } from '@angular/core';
import { MessagingService } from '@app/services/messaging/messaging.service';

@Injectable({
    providedIn: 'root',
})
export class CommandsService {
    readonly placeWordCommandRegex: RegExp = /^([a-o]){1}([1-9]|1[0-5]){1}([hv])+$/;
    readonly wordRegex: RegExp = /^[a-zA-Z]{1,15}$/;
    readonly messageRegex: RegExp = /^[a-zA-Z0-9 [:punct:]]{1,512}$/;

    constructor(public messagingService: MessagingService) {} // TODO: Inject: Reserve + Player

    /**
     * Parse the user' input and call the relevant functions
     *
     * @param input the user's input
     * @return if the operation is successful (so the text input knows if it must clear its value)
     */
    parseInput(input: string): boolean {
        // If the input starts with an exclamation mark, then it is interpreted as a command
        const args = input.split(' ');
        switch (args[0]) {
            case '!aide': {
                this.messagingService.sendMessage({
                    title: "Capsule d'aide",
                    body: "Vous avez appelé à l'aide!",
                    messageType: 'Log',
                    userId: 1,
                    timestamp: Date.now(),
                });
                return true;
            }
            case '!placer': {
                // Arguments: [COMMAND, OPTIONS, WORD]
                const options = args[1].match(this.placeWordCommandRegex); // Retrieve the parameters: column, row and direction
                if (options && options[1] && this.messageRegex.test(args[2])) {
                    // Call the placeSthFun
                } else {
                    // Invalid syntax
                    return false;
                }
                break;
            }
            case '!reserver': {
                const word = args[1].match(this.wordRegex);
                if (word && word[0]) {
                    // TODO: call the right function
                } else {
                    this.messagingService.sendMessage({
                        title: '',
                        body: 'Le mot saisi ne respecte pas le bon format...',
                        messageType: 'InputError',
                        userId: 1,
                        timestamp: Date.now(),
                    });
                    return false;
                }
                break;
            }
            case '!debug': {
                this.messagingService.sendMessage({
                    title: '',
                    body: this.messagingService.debuggingMode ? 'Affichages de débogages activés' : 'Affichages de débogages désactivés',
                    messageType: 'Log',
                    userId: 1,
                    timestamp: Date.now(),
                });
                this.messagingService.debuggingMode = !this.messagingService.debuggingMode;
                break;
            }
            case '!echanger': {
                // Reserve.drawLetter()
                break;
            }
            case '!passer': {
                // Player.completeTurn()
                break;
            }
            // If not a command, then it is probably a message
            default: {
                if (this.messageRegex.test(input)) {
                    this.messagingService.sendMessage({
                        title: '',
                        body: `${input}`,
                        messageType: 'UserMessage',
                        userId: 1,
                        timestamp: Date.now(),
                    });
                } else {
                    this.messagingService.sendMessage({
                        title: '',
                        body: 'Le format du message est invalide',
                        messageType: 'InputError',
                        userId: 0,
                        timestamp: Date.now(),
                    });
                    return false;
                }
            }
        }
        return true;
    }
}
