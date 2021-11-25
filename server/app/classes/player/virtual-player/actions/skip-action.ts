import { Action } from './action';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { MessageType } from '@common';
import { PlayerStatsNotifier } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-notifier';

export class SkipAction implements Action {
    constructor(private readonly statsNotifier: PlayerStatsNotifier, private readonly socketHandler: SocketHandler) {}

    execute(): Action | null {
        this.statsNotifier.notifySkip();

        this.socketHandler.sendMessage({ title: '', body: 'Tour sauté', messageType: MessageType.Message });
        return null;
    }
}
