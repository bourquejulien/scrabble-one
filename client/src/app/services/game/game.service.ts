import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EndGameWinner } from '@app/classes/end-game-winner';
import { PlayerType } from '@app/classes/player/player-type';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { PlayerService } from '@app/services/player/player.service';
import { RackService } from '@app/services/rack/rack.service';
import { SessionService } from '@app/services/session/session.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Answer, Failure, GameType, MessageType, ServerConfig, SessionStats, SinglePlayerConfig } from '@common';
import { environmentExt } from '@environment-ext';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

const localUrl = (base: string, call: string, id?: string) => `${environmentExt.apiUrl}${base}/${call}${id ? '/' + id : ''}`;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    stats: SessionStats;
    currentTurn: PlayerType;

    private readonly turnSubject: BehaviorSubject<PlayerType>;
    private readonly gameEndingSubject: Subject<EndGameWinner>;
    private readonly opponentQuitingSubject: Subject<boolean>;

    private gameRunning: boolean;

    constructor(
        private readonly playerService: PlayerService,
        private httpCLient: HttpClient,
        private readonly sessionService: SessionService,
        private readonly rackService: RackService,
        private readonly socketService: SocketClientService,
        private readonly messagingService: MessagingService,
    ) {
        this.stats = {
            localStats: { points: 0, rackSize: 0 },
            remoteStats: { points: 0, rackSize: 0 },
        };

        this.turnSubject = new BehaviorSubject<PlayerType>(PlayerType.Local);
        this.gameEndingSubject = new Subject<EndGameWinner>();
        this.opponentQuitingSubject = new Subject<boolean>();
        this.socketService.on('opponentQuit', () => this.opponentQuitingSubject.next(true));
        this.socketService.on('onTurn', async (id: string) => this.onNextTurn(id));
        this.socketService.on('endGame', async (winnerId: string) => this.endGame(winnerId));
        this.socketService.on('stats', (sessionStats: SessionStats) => this.refresh(sessionStats));
        this.currentTurn = PlayerType.Local;
        this.gameRunning = false;
    }

    async startSinglePlayer(config: SinglePlayerConfig): Promise<Failure<string> | void> {
        const answer = await this.httpCLient.put<Answer<ServerConfig, string>>(localUrl('game', 'init/single'), config).toPromise();

        if (!answer.isSuccess) {
            return answer;
        }

        const serverConfig = answer.payload;

        this.socketService.join(serverConfig.id);
        await this.start(serverConfig);
    }

    start(serverConfig: ServerConfig): void {
        this.sessionService.serverConfig = serverConfig;
        this.gameRunning = true;
        this.onNextTurn(serverConfig.startId);
    }

    async reset() {
        this.gameRunning = false;
        this.playerService.reset();
        this.socketService.reset();
    }

    get onTurn(): Observable<PlayerType> {
        return this.turnSubject.asObservable();
    }

    get onGameEnding(): Observable<EndGameWinner> {
        return this.gameEndingSubject.asObservable();
    }

    get onOpponentQuit(): Observable<boolean> {
        return this.opponentQuitingSubject.asObservable();
    }

    private async onNextTurn(id: string): Promise<void> {
        if (!this.gameRunning) return;

        let playerType: PlayerType;

        if (id === this.sessionService.id) {
            playerType = PlayerType.Local;
        } else {
            playerType = this.sessionService.gameConfig.gameType === GameType.SinglePlayer ? PlayerType.Virtual : PlayerType.Remote;
        }

        if (this.currentTurn === playerType) {
            return;
        }

        this.currentTurn = playerType;
        this.turnSubject.next(this.currentTurn);
    }

    private async endGame(winnerId: string) {
        let winner: EndGameWinner;

        if (winnerId === '') {
            winner = EndGameWinner.Draw;
        } else {
            winner = winnerId === this.sessionService.id ? EndGameWinner.Local : EndGameWinner.Remote;
        }

        this.gameEndingSubject.next(winner);

        this.messagingService.send(
            'Fin de partie - lettres restantes',
            this.sessionService.gameConfig.firstPlayerName + ' : ' + this.rackService.rack,
            MessageType.System,
        );
    }

    private refresh(sessionStats: SessionStats): void {
        this.stats = sessionStats;
    }
}
