import { Action } from './action';
import { PlayerData } from '@app/classes/player-data';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';

// TODO add messaging over sockets
export class ExchangeAction implements Action {
    constructor(private readonly reserve: ReserveHandler, /* private readonly messaging: Messaging, */ private readonly playerData: PlayerData) {}

    execute(): Action | null {
        const randomLetterCount = Math.floor(Math.random() * this.playerData.rack.length);
        // let exchangedLetters = '';
        for (let i = 0; i < randomLetterCount && this.reserve.length > 0; i++) {
            const letterToReplace = Math.floor(Math.random() * this.playerData.rack.length);
            const letter = this.playerData.rack[letterToReplace];
            const drawnLetter = this.reserve.drawLetter();
            // exchangedLetters += drawnLetter + ' ';
            this.reserve.putBackLetter(letter);
            this.playerData.rack[letterToReplace] = drawnLetter;
        }

        this.playerData.skippedTurns = 0;

        // this.messaging.send('', 'Lettres échangées :' + exchangedLetters, MessageType.Game);
        return null;
    }
}
