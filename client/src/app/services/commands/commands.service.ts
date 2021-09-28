import { Injectable } from '@angular/core';
import { Direction } from '@app/classes/board/direction';
import { MessageType } from '@app/classes/message';
import { Vec2 } from '@app/classes/vec2';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { PlayerService } from '@app/services/player/player.service';

@Injectable({
    providedIn: 'root',
})
export class CommandsService {
    placeWordCommandRegex: RegExp = /^([a-o]){1}([1-9]|1[0-5]){1}([hv]){1}$/;
    wordRegex: RegExp = /^[A-zÀ-ú]{1,15}$/; // This regex accepts lowerase and uppercase letters with and without accents
    messageRegex: RegExp = /^[A-zÀ-ú0-9 !.?'"]{1,512}$/;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    readonly charOffset = 97; // 'a' has ASCII value of 97

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
                    this.messagingService.send('Saisie invalide', 'Commande non reconnue', MessageType.Error);
                    return false;
            }
        } else {
            if (this.messageRegex.test(input)) {
                this.messagingService.send("L'autre utilisateur dit", input, MessageType.Message);
            } else {
                this.messagingService.send('Message ne respecte pas le format', 'Format du message inrecevable', MessageType.Error);
                return false;
            }
        }
        return true;
    }

    private showHelp() {
        this.messagingService.send("Capsule d'aide", "Vous avez appelé à l'aide", MessageType.Log);
    }

    private checkPlaceCommand(options: string, word: string): boolean {
        // Arguments: [COMMAND, OPTIONS, WORD]
        // Options: [Y, X, DIRECTION]
        if (options && options[1] && this.wordRegex.test(word)) {
            const yCoordinate = Number(options.charCodeAt(0) - this.charOffset);
            const xCoordinate = Number(options.charAt(1)) - 1;
            const direction: Direction = options.charAt(2) === 'v' ? Direction.Down : Direction.Right;
            const vecCoordinate: Vec2 = { x: xCoordinate, y: yCoordinate };
            this.playerService.placeLetters(word, vecCoordinate, direction);
        } else {
            this.messagingService.send('', 'Erreur survenue', MessageType.Error);
            return false;
        }

        return true;
    }

    private exchangeLetter(letter: string): void {
        // According to game logic, there can be 1 to 7 letters to exchange
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (letter.length >= 1 && letter.length <= 7) {
            this.playerService.exchangeLetters(letter);
        } else {
            this.messagingService.send('', "Vous n'avez pas saisi une lettre", MessageType.Error);
        }
    }

    private skipTurn(): void {
        this.playerService.completeTurn();
    }

    private toggleDebug(): void {
        this.messagingService.debuggingMode = !this.messagingService.debuggingMode;
        this.messagingService.send(
            '',
            this.messagingService.debuggingMode ? 'Affichages de débogages activés' : 'Affichages de débogages désactivés',
            MessageType.Log,
        );
    }
}
