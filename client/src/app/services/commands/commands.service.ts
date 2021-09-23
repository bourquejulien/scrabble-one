import { Injectable } from '@angular/core';
import { Direction } from '@app/classes/board/direction';
import { Vec2 } from '@app/classes/vec2';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { PlayerService } from '@app/services/player/player.service';

enum Command {
    Help,
    Skip,
    Exchange,
    Debug,
    Place,
}
@Injectable({
    providedIn: 'root',
})
export class CommandsService {
    placeWordCommandRegex: RegExp = /^([a-o]){1}([1-9]|1[0-5]){1}([hv])+$/;
    wordRegex: RegExp = /^[a-zA-Z]{1,15}$/;
    messageRegex: RegExp = /^[a-zA-Z0-9 [:punct:]]{1,512}$/;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    charOffset = 97; // TODO: constant to cap letters 'a' has ASCII value of 97

    skipCommand: string = '!passer';
    helpCommand: string = '!aide';
    placeCommand: string = '!placer';
    debugCommand: string = '!debug';
    exchangeCommand: string = '!echanger';

    commandValue: Map<string, Command> = new Map();
    // Function type is required by the strategy pattern
    // eslint-disable-next-line @typescript-eslint/ban-types
    commandAction: Map<Command, Function> = new Map();

    constructor(public messagingService: MessagingService, private playerService: PlayerService) {
        this.bindActions();
        this.bindCommands();
    }

    parseInput(input: string): boolean {
        // If the input starts with an exclamation mark, then it is interpreted as a command
        const args = input.split(' ');
        const command = this.commandValue.get(args[0]);
        if (command) {
            // const action = this.commandAction.get(command);
        } else {
            this.messagingService.sendUserMessage(input);
        }
        return true;
    }

    showHelp() {
        this.messagingService.log("Capsule d'aide", "Vous avez appelé à l'aide");
    }

    checkPlaceCommand(word: string, options: string[]) {
        // Arguments: [COMMAND, OPTIONS, WORD]
        // Options: [Y, X, DIRECTION]
        if (options && options[1] && this.wordRegex.test(word)) {
            const yCoordinate = Number(options[1].charCodeAt(0) - this.charOffset);
            const xCoordinate = Number(options[2].toString()) - 1;
            const direction: Direction = options[3] === 'v' ? Direction.Down : Direction.Right;
            const vecCoordinate: Vec2 = { x: xCoordinate, y: yCoordinate };
            const operationResult: string = this.playerService.placeLetters(word, vecCoordinate, direction);
            this.messagingService.log('', operationResult);
        } else {
            // Invalid syntax
            return false;
        }
        return true;
    }

    private exchangeLetter(letter: string): void {
        if (letter && letter.length === 1) {
            this.playerService.exchangeLetters(letter);
        }
    }

    private skipTurn(): void {
        this.playerService.completeTurn();
    }

    private toggleDebug(): void {
        this.messagingService.debuggingMode = !this.messagingService.debuggingMode;
        this.messagingService.log('', this.messagingService.debuggingMode ? 'Affichages de débogages activés' : 'Affichages de débogages désactivés');
    }

    private bindCommands(): void {
        this.commandValue
            .set(this.skipCommand, Command.Skip)
            .set(this.helpCommand, Command.Help)
            .set(this.placeCommand, Command.Place)
            .set(this.exchangeCommand, Command.Exchange)
            .set(this.debugCommand, Command.Debug);
    }

    private bindActions(): void {
        this.commandAction
            .set(Command.Skip, this.skipTurn)
            .set(Command.Help, this.showHelp)
            .set(Command.Place, this.checkPlaceCommand)
            .set(Command.Exchange, this.exchangeLetter)
            .set(Command.Debug, this.toggleDebug);
    }
}
