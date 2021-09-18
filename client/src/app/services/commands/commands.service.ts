import { Injectable } from '@angular/core';
import { MessagingService } from '@app/services/messaging/messaging.service';

@Injectable({
    providedIn: 'root',
})
export class CommandsService {
    debuggingMode: boolean;
    // TODO: create dependency to the reserve service

    readonly placeWordCommandRegex: RegExp = /^([a-o]){1}([1-9]|1[0-5]){1}([hv])+$/;
    readonly wordRegex: RegExp = /^[a-zA-Z]{1,15}$/;
    readonly messageRegex: RegExp = /^[a-zA-Z0-9 [:punct:]]{1,512}$/;

    constructor(public messagingService: MessagingService) {} // TODO: Inject: + User

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
                this.messagingService.sendMessage({
                    title: "Capsule d'aide",
                    body: "Vous avez appelé à l'aide aide!",
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
                    this.messagingService.sendMessage({
                        title: '',
                        body: `Placé ${args[2]}`,
                        messageType: 'Log',
                        userId: 1,
                        timestamp: Date.now(),
                    });
                } else {
                    this.messagingService.sendMessage({
                        title: '',
                        body: 'Invalide: mot non fourni ou options invalides',
                        messageType: 'InputError',
                        userId: 1,
                        timestamp: Date.now(),
                    });
                }
                break;
            }
            case '!reserver': {
                const word = args[1].match(this.wordRegex);
                if (word && word[0]) {
                    this.messagingService.sendMessage({
                        title: '',
                        body: `Mot réservé ${word[0]}`,
                        messageType: 'Log',
                        userId: 1,
                        timestamp: Date.now(),
                    });
                } else {
                    this.messagingService.sendMessage({
                        title: '',
                        body: 'Mot invalide',
                        messageType: 'InputError',
                        userId: 1,
                        timestamp: Date.now(),
                    });
                }
                break;
            }
            case '!debug': {
                this.messagingService.sendMessage({
                    title: '',
                    body: this.debuggingMode ? 'Affichages de débogages activés' : 'Affichages de débogages désactivés',
                    messageType: 'Log',
                    userId: 1,
                    timestamp: Date.now(),
                });
                this.debuggingMode = !this.debuggingMode;
                break;
            }
            case '!echanger': {
                // drawLetter
                this.messagingService.sendMessage({
                    title: '',
                    body: 'Échanger',
                    messageType: 'Log',
                    userId: 1,
                    timestamp: Date.now(),
                });
                break;
            }
            // If not a command, it is probably a message
            default: {
                if (input.match(this.messageRegex)) {
                    this.messagingService.sendMessage({
                        title: '',
                        body: `${input}`,
                        messageType: 'Log',
                        userId: 1,
                        timestamp: Date.now(),
                    });
                } else {
                    this.messagingService.sendMessage({
                        title: '',
                        body: 'MEssage passse pas = ' + input,
                        messageType: 'InputError',
                        userId: 1,
                        timestamp: Date.now(),
                    });
                }
                break;
            }
        }
    }
}
