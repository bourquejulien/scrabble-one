import { Injectable } from '@angular/core';
import { PlayerType } from '@app/classes/player/player-type';
import { Constants } from '@app/constants/global.constants';
import { GameService } from '@app/services/game/game.service';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { PlayerService } from '@app/services/player/player.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { Direction, LETTER_DEFINITIONS, MessageType, Vec2, SystemMessages } from '@common';

const MAX_PARAMETER_COUNT = 3;

@Injectable({
    providedIn: 'root',
})
export class CommandsService {
    wordRegex: RegExp;
    rackRegex: RegExp;
    messageRegex: RegExp;
    private placeWordCommandRegex: RegExp;

    constructor(
        private readonly messagingService: MessagingService,
        private readonly playerService: PlayerService,
        private readonly gameService: GameService,
        private readonly reserveService: ReserveService,
    ) {
        this.placeWordCommandRegex = /^([a-o]){1}([1-9]|1[0-5]){1}([hv]){1}$/;
        this.wordRegex = /^[A-zÀ-ú]{1,15}$/;
        this.rackRegex = /^[a-z*]{1,7}$/;
        this.messageRegex = /^[A-zÀ-ú0-9 !.?'"]{1,512}$/;
    }

    // Source: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript by Lewis Diamond on 05/29/16
    private static removeAccents(word: string): string {
        return word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    }

    parseInput(input: string): boolean {
        let successfulCommand = false;
        const isCommand = input.startsWith('!');

        // Arguments: [COMMAND, OPTIONS, WORD]
        if (isCommand) {
            const args = input.split(' ');
            const parameterCount = args.length;

            args.length = MAX_PARAMETER_COUNT;
            args.fill('', parameterCount);
            switch (args[0]) {
                case '!aide':
                    this.showHelp();
                    break;
                case '!debug':
                    this.toggleDebug();
                    break;
                case '!placer':
                    successfulCommand = this.checkPlaceCommand(args[1], CommandsService.removeAccents(args[2]));
                    break;
                case '!passer':
                    successfulCommand = this.skipTurn();
                    break;
                case '!échanger':
                    successfulCommand = this.exchangeLetters(CommandsService.removeAccents(args[1]));
                    break;
                case '!réserve':
                    successfulCommand = this.displayReserve();
                    break;
                default:
                    this.messagingService.send('', SystemMessages.InvalidCommand, MessageType.Error);
                    return false;
            }
            if (successfulCommand) {
                this.messagingService.send('Commande réussie', input, MessageType.System);
            }
        }
        if (this.messageRegex.test(input)) {
            this.messagingService.send('', input, MessageType.Message);
        } else {
            this.messagingService.send(SystemMessages.InvalidFormat, SystemMessages.InvalidUserMessage, MessageType.Error);
            return false;
        }
        return true;
    }

    // TO DO return false... somewhere
    private displayReserve(): boolean {
        const body: string[] = [];
        let reserveContent = '';

        for (const letter of LETTER_DEFINITIONS) {
            const currentLetterAndQuantity = this.reserveService.getLetterAndQuantity(letter[0]);
            body.push(`${currentLetterAndQuantity}\n`);
        }

        reserveContent = body.join('');
        this.messagingService.send(SystemMessages.ReserveContentTitle, reserveContent, MessageType.Log);

        return true;
    }

    private showHelp() {
        this.messagingService.send(SystemMessages.HelpTitle, SystemMessages.HelpMessage, MessageType.System);
    }

    private checkPlaceCommand(options: string, word: string): boolean {
        if (!this.isUsersTurn()) {
            return false;
        }

        if (!this.placeWordCommandRegex.test(options)) {
            this.messagingService.send('', SystemMessages.InvalidOptions, MessageType.Error);
            return false;
        }

        if (this.wordRegex.test(word)) {
            const yCoordinate = Number(options.charCodeAt(0) - Constants.CHAR_OFFSET);
            const xCoordinate = Number(options.charAt(1)) - 1;
            const direction: Direction = options.charAt(2) === 'v' ? Direction.Down : Direction.Right;
            const vecCoordinate: Vec2 = { x: xCoordinate, y: yCoordinate };
            this.playerService.placeLetters(word, vecCoordinate, direction);

            return true;
        }
        this.messagingService.send('', SystemMessages.InvalidWord, MessageType.Error);
        return false;
    }

    private exchangeLetters(letters: string): boolean {
        if (!this.isUsersTurn()) {
            return false;
        }

        if (this.rackRegex.test(letters)) {
            this.playerService.exchangeLetters(letters);
            return true;
        }
        this.messagingService.send('', SystemMessages.InvalidLetters, MessageType.Error);
        return false;
    }

    private skipTurn(): boolean {
        if (!this.isUsersTurn()) {
            return false;
        }

        this.playerService.skipTurn();
        return true;
    }

    private toggleDebug(): void {
        this.messagingService.isDebug = !this.messagingService.isDebug;
        this.messagingService.send('', this.messagingService.isDebug ? SystemMessages.DebugOn : SystemMessages.DebugOff, MessageType.System);
    }

    private isUsersTurn(): boolean {
        if (this.gameService.currentTurn !== PlayerType.Local) {
            this.messagingService.send('', SystemMessages.InvalidTurn, MessageType.System);
            return false;
        }
        return true;
    }
}
