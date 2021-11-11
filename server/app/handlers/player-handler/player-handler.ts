import { Player } from '@app/classes/player/player';
import { Config } from '@app/config';
import { Observable, Subject, Subscription } from 'rxjs';

export class PlayerHandler {
    players: Player[];
    private nextTurn: Subject<string>;
    private playerSubscriptions: Map<string, Subscription>;

    constructor() {
        this.players = [];
        this.nextTurn = new Subject<string>();
        this.playerSubscriptions = new Map<string, Subscription>();
    }

    start(): void {
        this.players.forEach((p) => p.fillRack());
        this.initialTurn();
    }

    dispose(): void {
        this.playerSubscriptions.forEach((s) => s.unsubscribe());
    }

    addPlayer(player: Player): void {
        this.playerSubscriptions[player.id] = player.onTurn().subscribe((lastId) => this.switchTurn(lastId));
        this.players.push(player);
    }

    removePlayer(id: string): Player | null {
        const playerIndex = this.players.findIndex((p) => p.id === id);

        if (playerIndex < 0) return null;

        const removedPlayer = this.players.splice(playerIndex, 1)[0];

        (this.playerSubscriptions.get(removedPlayer.id) as Subscription).unsubscribe();
        this.playerSubscriptions.delete(removedPlayer.id);

        return removedPlayer;
    }

    onTurn(): Observable<string> {
        return this.nextTurn.asObservable();
    }
    /*
    infoToVirtual(playerId: string): void {
        const playerIndex = this.players.findIndex((p) => p.id === playerId) ?? -1;
        if (playerIndex === -1) return;
        this.playerSubscriptions.get(this.players[playerIndex].id)?.unsubscribe();
        this.removePlayer(playerId);
        this.playerSubscriptions[playerId] = this.players[playerIndex].onTurn().subscribe((lastId) => this.switchTurn(lastId));
    }
*/
    get isOverSkipLimit(): boolean {
        return this.players.map((p) => p.playerData.skippedTurns > Config.MAX_SKIP_TURN).reduce((acc, isMaxSkip) => acc && isMaxSkip);
    }

    get rackEmptied(): boolean {
        return this.players.map((p) => p.playerData.rack.length === 0).reduce((acc, isEmpty) => acc || isEmpty);
    }

    get winner(): string {
        if (this.players[0].stats.points === this.players[1].stats.points) {
            return '';
        }
        return this.players.reduce((winner, player) => (player.stats.points > winner.stats.points ? player : winner)).id;
    }

    private initialTurn(): void {
        const randomPlayerIndex = Math.floor(this.players.length * Math.random());
        const id = this.players[randomPlayerIndex].id;

        this.switchTurn(id);
    }

    private switchTurn(lastId: string): void {
        const nextPlayerId = this.players.map((p) => p.id).find((id) => id !== lastId) ?? '';
        this.nextTurn.next(nextPlayerId);
    }
}
