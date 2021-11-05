import { Action } from './action';
import { PlayerData } from '@app/classes/player-data';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { MessageType } from '@common';

export class ExchangeAction implements Action {
    constructor(private readonly reserve: ReserveHandler, private readonly socketHandler: SocketHandler, private readonly playerData: PlayerData) {}

    execute(): Action | null {
        const exchangeCount = Math.min(this.reserve.length, Math.ceil(Math.random() * this.playerData.rack.length));

        for (let i = 0; i < exchangeCount; i++) {
            const indexToReplace = Math.floor(Math.random() * this.playerData.rack.length);
            const letter = this.playerData.rack[indexToReplace];
            const drawnLetter = this.reserve.drawLetter();
            this.reserve.putBackLetter(letter);
            this.playerData.rack[indexToReplace] = drawnLetter;
        }

        this.playerData.skippedTurns = 0;
        this.socketHandler.sendMessage({ title: '', body: `${exchangeCount} lettres échangées`, messageType: MessageType.Message });

        return null;
    }
}
