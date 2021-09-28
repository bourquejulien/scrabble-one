import { Injectable } from '@angular/core';
import { Direction } from '@app/classes/board/direction';
import { MessageType } from '@app/classes/message';
import { Vec2 } from '@app/classes/vec2';
import { Constants } from '@app/constants/global.constants';
import { SystemMessages } from '@app/constants/system-messages.constants';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { PlayerService } from '@app/services/player/player.service';

@Injectable({
    providedIn: 'root',
})
export class CommandsService {
    placeWordCommandRegex: RegExp = /^([a-o]){1}([1-9]|1[0-5]){1}([hv]){1}$/;
    wordRegex: RegExp = /^[A-zÀ-ú]{1,15}$/;
    rackRegex: RegExp = /^[A-zÀ-ú]{1,7}$/;
    messageRegex: RegExp = /^[A-zÀ-ú0-9 !.?'"]{1,512}$/;

    constructor(public messagingService: MessagingService, public playerService: PlayerService) {}

    parseInput(input: string): boolean {
        // Arguments: [COMMAND, OPTIONS, WORD]
        if (input.startsWith('!')) {
            const args = input.split(' ');
            switch (args[0]) {
                case '!aide':
                    this.showHelp();
                    break;
                case '!debug':
                    this.toggleDebug();
                    break;
                case '!placer':
                    this.checkPlaceCommand(args[1], args[2]);
                    break;
                case '!passer':
                    this.skipTurn();
                    break;
                case '!echanger':
                    this.exchangeLetter(args[1]);
                    break;
                default:
                    this.messagingService.send('', SystemMessages.InvalidCommand, MessageType.Error);
                    return false;
            }
        } else {
            if (this.messageRegex.test(input)) {
                this.messagingService.send('', input, MessageType.Message);
            } else {
                this.messagingService.send(SystemMessages.InvalidFormat, SystemMessages.InvalidUserMessage, MessageType.Error);
                return false;
            }
        }
        return true;
    }

    private showHelp() {
        this.messagingService.send(SystemMessages.HelpTitle, SystemMessages.HelpMessage, MessageType.Log);
    }

    private checkPlaceCommand(options: string, word: string): boolean {
        if (!this.placeWordCommandRegex.test(options)) {
            this.messagingService.send('', SystemMessages.InvalidOptions, MessageType.Error);
            return false;
        }
        // Arguments: [COMMAND, OPTIONS, WORD]
        // Options: [Y, X, DIRECTION]
        if (this.wordRegex.test(word)) {
            const yCoordinate = Number(options.charCodeAt(0) - Constants.CHAR_OFFSET);
            const xCoordinate = Number(options.charAt(1)) - 1;
            const direction: Direction = options.charAt(2) === 'v' ? Direction.Down : Direction.Right;
            const vecCoordinate: Vec2 = { x: xCoordinate, y: yCoordinate };
            this.playerService.placeLetters(word, vecCoordinate, direction);
        } else {
            this.messagingService.send('', SystemMessages.InvalidWord, MessageType.Error);
            return false;
        }

        return true;
    }

    private exchangeLetter(letters: string): void {
        if (this.rackRegex.test(letters)) {
            this.playerService.exchangeLetters(letters);
        } else {
            this.messagingService.send('', SystemMessages.InvalidLetters, MessageType.Error);
        }
    }

    private skipTurn(): void {
        this.playerService.completeTurn();
    }

    private toggleDebug(): void {
        this.messagingService.debuggingMode = !this.messagingService.debuggingMode;
        this.messagingService.send('', this.messagingService.debuggingMode ? SystemMessages.DebugOn : SystemMessages.DebugOff, MessageType.Log);
    }
}
