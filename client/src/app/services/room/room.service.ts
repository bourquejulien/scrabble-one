import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { JoinServerConfig, MultiplayerCreateConfig, MultiplayerJoinConfig, ServerConfig } from '@common';
import { environmentExt } from '@environmentExt';
import { HttpClient } from '@angular/common/http';
import { GameService } from '@app/services/game/game.service';
import { Observable, Subject } from 'rxjs';

const localUrl = (base: string, call: string, id?: string) => `${environmentExt.apiUrl}${base}/${call}${id ? '/' + id : ''}`;

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    private availableRooms: string[];
    private readonly hasJoined: Subject<JoinServerConfig>;

    private pendingRoomId: string | null;

    constructor(
        private readonly socketService: SocketClientService,
        private readonly gameService: GameService,
        private readonly httpCLient: HttpClient,
    ) {
        this.availableRooms = [];
        this.hasJoined = new Subject<JoinServerConfig>();
        this.pendingRoomId = null;
    }

    init(): void {
        this.socketService.on('availableRooms', (rooms: string[]) => {
            this.availableRooms = rooms;
        });
        this.pendingRoomId = null;
    }

    async create(createConfig: MultiplayerCreateConfig): Promise<void> {
        const id = await this.httpCLient.put<string>(localUrl('game', 'init/multi'), createConfig).toPromise();
        this.socketService.join(id);

        this.pendingRoomId = id;

        this.socketService.on('onJoin', async (joinServerConfig: JoinServerConfig) => {
            await this.gameService.start(joinServerConfig.serverConfig, joinServerConfig.startId);
            this.hasJoined.next(joinServerConfig);
        });
    }

    async abort(): Promise<void> {
        if (this.pendingRoomId == null) {
            return;
        }

        await this.httpCLient.delete<string>(localUrl('game', 'stop', this.pendingRoomId)).toPromise();
        this.socketService.reset();
    }

    async join(id: string): Promise<void> {
        const joinConfig: MultiplayerJoinConfig = {
            sessionId: id,
            playerName: 'test', // TODO
        };

        const serverConfig = await this.httpCLient.put<ServerConfig>(localUrl('game', 'join'), joinConfig).toPromise();
        this.socketService.join(serverConfig.id);
        const startId = await this.httpCLient.get<string>(localUrl('game', 'start', serverConfig.id)).toPromise();

        await this.gameService.start(serverConfig, startId);
    }

    refresh(): void {
        this.socketService.send('getRooms');
    }

    get rooms(): string[] {
        return this.availableRooms;
    }

    get onGameFull(): Observable<JoinServerConfig> {
        return this.hasJoined.asObservable();
    }
}
