import { Player } from '@app/classes/player/player';
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
        this.playerSubscriptions.set(
            player.id,
            player.onTurn().subscribe((lastId) => this.switchTurn(lastId)),
        );
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
