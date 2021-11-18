import { Action } from './action';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { MessageType } from '@common';
import { PlayerStatsHandler } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-handler';

export class SkipAction implements Action {
    constructor(private readonly statsHandler: PlayerStatsHandler, private readonly socketHandler: SocketHandler) {}

    execute(): Action | null {
        this.statsHandler.onSkip();

        this.socketHandler.sendMessage({ title: '', body: 'Tour sauté', messageType: MessageType.Message });
        return null;
    }
}
