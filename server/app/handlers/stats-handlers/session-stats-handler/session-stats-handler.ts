import { Config } from '@app/config';
import { PlayerStatsHandler } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { Subscription } from 'rxjs';
import { GoalHandler } from '@app/handlers/goal-handler/goal-handler';
import { SessionStats } from '@common';

export class SessionStatsHandler {
    subscriptions: Subscription[];
    playerStatsHandlers: PlayerStatsHandler[];

    constructor(
        private readonly socketHandler: SocketHandler,
        private readonly reserveHandler: ReserveHandler,
        private readonly goalHandler: GoalHandler,
    ) {
        this.subscriptions = [];
        this.playerStatsHandlers = [];
    }

    generatePlayerStatsHandler(rack: string[], id: string): PlayerStatsHandler {
        const handler = new PlayerStatsHandler(this.goalHandler, rack, id);
        this.playerStatsHandlers.push(handler);

        return handler;
    }

    endGame(): void {
        this.playerStatsHandlers.forEach((p) => (p.scoreAdjustment -= p.rackPoints()));
        if (this.reserveHandler.length === 0 && this.rackEmptied) {
            this.playerStatsHandlers[0].scoreAdjustment += this.playerStatsHandlers[1].rackPoints();
            this.playerStatsHandlers[1].scoreAdjustment += this.playerStatsHandlers[0].rackPoints();
        }
    }

    getStats(id: string): SessionStats | null {
        const index = this.playerStatsHandlers.findIndex((p) => p.id === id);
        const firstPlayer = this.playerStatsHandlers[index];
        const secondPlayer = this.playerStatsHandlers[1 - index];

        if (firstPlayer == null || secondPlayer == null) {
            return null;
        }

        return { localStats: firstPlayer.stats, remoteStats: secondPlayer.stats };
    }

    get isEndGame(): boolean {
        return this.isOverSkipLimit || (this.reserveHandler.length === 0 && this.rackEmptied);
    }

    get winner(): string {
        if (this.playerStatsHandlers[0].stats.points === this.playerStatsHandlers[1].stats.points) {
            return '';
        }
        return this.playerStatsHandlers.reduce((winner, player) => (player.stats.points > winner.stats.points ? player : winner)).id;
    }

    private get isOverSkipLimit(): boolean {
        for (const playerHandler of this.playerStatsHandlers) {
            if (playerHandler.skippedTurns <= Config.MAX_SKIP_TURN) {
                return false;
            }
        }
        return true;
    }

    private get rackEmptied(): boolean {
        return this.playerStatsHandlers.map((p) => p.rack.length === 0).reduce((acc, isEmpty) => acc || isEmpty);
    }
}
