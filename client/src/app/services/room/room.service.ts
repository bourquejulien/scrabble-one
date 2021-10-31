import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { JoinServerConfig, MultiplayerCreateConfig, MultiplayerJoinConfig, ServerConfig } from '@common';
import { environmentExt } from '@environmentExt';
import { HttpClient } from '@angular/common/http';
import { GameService } from '@app/services/game/game.service';

const localUrl = (base: string, call: string, id?: string) => `${environmentExt.apiUrl}${base}/${call}${id ? '/' + id : ''}`;

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    private readonly availableRooms: string[];

    constructor(
        private readonly socketService: SocketClientService,
        private readonly gameService: GameService,
        private readonly httpCLient: HttpClient,
    ) {
        this.availableRooms = [''];
    }

    async create(createConfig: MultiplayerCreateConfig): Promise<void> {
        const id = await this.httpCLient.put<string>(localUrl('game', 'init/multi'), createConfig).toPromise();
        this.socketService.join(id);

        this.socketService.on('onJoin', (joinServerConfig: JoinServerConfig) => {
            this.gameService.start(joinServerConfig.serverConfig, joinServerConfig.startId);
        });
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
}
