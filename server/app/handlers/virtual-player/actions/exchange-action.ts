import { MessageType } from '@app/classes/messaging/message';
import { Messaging } from '@app/classes/messaging/messaging';
import { Reserve } from '@app/classes/reserve/reserve';
import { PlayerData } from '@common';
import { Action } from './action';

export class ExchangeAction implements Action {
    constructor(private readonly reserve: Reserve, private readonly messaging: Messaging, private readonly playerData: PlayerData) {}

    execute(): Action | null {
        const randomLetterCount = Math.floor(Math.random() * this.playerData.rack.length);
        let exchangedLetters = '';
        for (let i = 0; i < randomLetterCount && this.reserve.length > 0; i++) {
            const letterToReplace = Math.floor(Math.random() * this.playerData.rack.length);
            const letter = this.playerData.rack[letterToReplace];
            const drawnLetter = this.reserve.drawLetter();
            exchangedLetters += drawnLetter + ' ';
            this.reserve.putBackLetter(letter);
            this.playerData.rack[letterToReplace] = drawnLetter;
        }

        this.playerData.skippedTurns = 0;

        this.messaging.send('', 'Lettres échangées :' + exchangedLetters, MessageType.Game);
        return null;
    }
}
