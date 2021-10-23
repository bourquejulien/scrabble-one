import { PlayerData } from '@app/classes/player-data';
import { MessageType } from '@common';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { Action } from './action';

export class ExchangeAction implements Action {
    constructor(
        private readonly reserveService: ReserveService,
        private readonly messagingService: MessagingService,
        private readonly playerData: PlayerData,
    ) {}

    execute(): Action | null {
        const randomLetterCount = Math.floor(Math.random() * this.playerData.rack.length);
        let exchangedLetters = '';
        for (let i = 0; i < randomLetterCount && this.reserveService.length > 0; i++) {
            const letterToReplace = Math.floor(Math.random() * this.playerData.rack.length);
            const letter = this.playerData.rack[letterToReplace];
            const drawnLetter = this.reserveService.drawLetter();
            exchangedLetters += drawnLetter + ' ';
            this.reserveService.putBackLetter(letter);
            this.playerData.rack[letterToReplace] = drawnLetter;
        }

        this.playerData.skippedTurns = 0;

        this.messagingService.send('', 'Lettres échangées :' + exchangedLetters, MessageType.Game);
        return null;
    }
}
