import { Injectable } from '@angular/core';
import { Direction } from '@app/classes/board/direction';
import { Vec2 } from '@app/classes/vec2';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { PlayerService } from '@app/services/player/player.service';
import { ReserveService } from '@app/services/reserve/reserve.service';

@Injectable({
    providedIn: 'root',
})
export class CommandsService {
    readonly placeWordCommandRegex: RegExp = /^([a-o]){1}([1-9]|1[0-5]){1}([hv])+$/;
    readonly wordRegex: RegExp = /^[a-zA-Z]{1,15}$/;
    readonly messageRegex: RegExp = /^[a-zA-Z0-9 [:punct:]]{1,512}$/;

    // TODO: retrieve user id from Player
    constructor(public messagingService: MessagingService, private playerService: PlayerService, private reserveService: ReserveService) {}
    /**
     * Parse the user' input and call the relevant functions
     *
     * @param input the user's input
     * @return if the operation is successful (so the text input knows if it must clear its value)
     */
    // TODO: this method seems too long to me... each message object take a few lines...
    parseInput(input: string): boolean {
        // If the input starts with an exclamation mark, then it is interpreted as a command
        const args = input.split(' ');
        switch (args[0]) {
            case '!aide': {
                this.messagingService.sendMessage({
                    title: "Capsule d'aide",
                    body: "Vous avez appelé à l'aide!",
                    messageType: 'UserMessage',
                    userId: 1,
                    timestamp: Date.now(),
                });
                return true;
            }
            case '!placer': {
                // Arguments: [COMMAND, OPTIONS, WORD]
                // Options: [X, Y, DIRECTION]
                const word = args[2];
                const options = args[1].match(this.placeWordCommandRegex); // Retrieve the parameters: column, row and direction
                if (options && options[1] && this.wordRegex.test(word)) {
                    // N.B.: the letter 'a' has value 97, hence the magic number
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                    const xCoordinate: number = (options[1].charCodeAt(0) - 96) as number;
                    // TODO: review
                    const yCoordinate = Number(options[2].toString());
                    const direction: Direction = options[3] === 'v' ? Direction.Down : Direction.Right;
                    const vecCoordinate: Vec2 = { x: xCoordinate, y: yCoordinate };
                    this.playerService.placeLetters(word, vecCoordinate, direction);
                } else {
                    // Invalid syntax
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
                // TODO: validation !echanger
                this.reserveService.drawLetter();
                break;
            }
            case '!passer': {
                this.playerService.completeTurn();
                break;
            }
            // If not a command, then it is probably a message
            default: {
                // TODO: if (this.messageRegex.test(input)) {
                this.messagingService.sendMessage({
                    title: '',
                    body: `${input}`,
                    messageType: 'UserMessage',
                    userId: 1,
                    timestamp: Date.now(),
                });
            }
        }
        return true;
    }
}
