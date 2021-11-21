import { Config } from '@app/config';
import { PlayerStatsHandler } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { Subscription } from 'rxjs';
import { GoalHandler } from '@app/handlers/goal-handler/goal-handler';
import { GameMode, MessageType, SessionStats } from '@common';
import { Log2990GoalHandler } from '@app/handlers/goal-handler/log2990-goal-handler';

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
        this.subscriptions.push(goalHandler.onUpdate.subscribe(() => this.onUpdatedBonus()));
    }

    generatePlayerStatsHandler(id: string): PlayerStatsHandler {
        const handler = new PlayerStatsHandler(this.goalHandler, id);
        this.playerStatsHandlers.push(handler);
        this.subscriptions.push(handler.onUpdate.subscribe(() => this.onUpdatedStats()));
        return handler;
    }

    start() {
        const ids = this.playerStatsHandlers.map((p) => p.id);
        this.goalHandler.start(ids);
    }

    end(): void {
        this.playerStatsHandlers.forEach((p) => (p.scoreAdjustment -= p.rackScore));
        if (this.reserveHandler.length === 0 && this.rackEmptied) {
            this.playerStatsHandlers[0].scoreAdjustment += this.playerStatsHandlers[1].rackScore;
            this.playerStatsHandlers[1].scoreAdjustment += this.playerStatsHandlers[0].rackScore;
        }
        this.onUpdatedStats();

        this.subscriptions.forEach((s) => s.unsubscribe());
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

    get gameMode(): GameMode {
        return this.goalHandler instanceof Log2990GoalHandler ? GameMode.Log2990 : GameMode.Classic;
    }

    private onUpdatedStats() {
        this.playerStatsHandlers.map((ps) => ps.id).forEach((id) => this.socketHandler.sendData('stats', this.getStats(id), id));
    }

    private onUpdatedBonus() {
        this.onUpdatedStats();
        this.playerStatsHandlers.map((ps) => ps.id).forEach((id) => this.socketHandler.sendData('goals', this.goalHandler.getGoalsData(id), id));
        this.playerStatsHandlers
            .map((ps) => ps.id)
            .forEach((id) =>
                this.socketHandler.sendMessage({
                    title: 'Bonuses',
                    body: this.goalHandler
                        .getGoalsData(id)
                        .map((g) => `score:${g.score} - name:${g.name} - status:${g.status} - isGlobal:${g.isGlobal}`)
                        .join('\n'),
                    messageType: MessageType.System,
                }),
            );
    }

    private getStats(id: string): SessionStats | null {
        const index = this.playerStatsHandlers.findIndex((p) => p.id === id);
        const firstPlayer = this.playerStatsHandlers[index];
        const secondPlayer = this.playerStatsHandlers[1 - index];

        if (firstPlayer == null || secondPlayer == null) {
            return null;
        }

        return { localStats: firstPlayer.stats, remoteStats: secondPlayer.stats };
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
        return this.playerStatsHandlers.map((p) => p.rackSize === 0).reduce((acc, isEmpty) => acc || isEmpty);
    }
}
