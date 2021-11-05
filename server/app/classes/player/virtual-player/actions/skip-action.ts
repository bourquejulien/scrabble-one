import { PlayerData } from '@app/classes/player-data';
import { Action } from './action';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { MessageType } from '@common';

export class SkipAction implements Action {
    constructor(private readonly playerData: PlayerData, private readonly socketHandler: SocketHandler) {}

    execute(): Action | null {
        this.playerData.skippedTurns++;

        this.socketHandler.sendMessage({ title: '', body: 'Tour sauté', messageType: MessageType.Message });
        return null;
    }
}
