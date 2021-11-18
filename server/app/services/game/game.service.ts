import { generateId } from '@app/classes/id';
import { PlayerData } from '@app/classes/player-data';
import { PlayerInfo } from '@app/classes/player-info';
import { HumanPlayer } from '@app/classes/player/human-player/human-player';
import { VirtualPlayer } from '@app/classes/player/virtual-player/virtual-player';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { BoardGeneratorService } from '@app/services/board/board-generator.service';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { SocketService } from '@app/services/socket/socket-service';
import { ConvertConfig, GameType, MultiplayerCreateConfig, MultiplayerJoinConfig, ServerConfig, SinglePlayerConfig } from '@common';
import { Service } from 'typedi';
import * as logger from 'winston';

@Service()
export class GameService {
    constructor(
        private readonly boardGeneratorService: BoardGeneratorService,
        private readonly sessionHandlingService: SessionHandlingService,
        private readonly dictionnaryService: DictionaryService,
        private readonly socketService: SocketService,
    ) {}

    async initSinglePlayer(gameConfig: SinglePlayerConfig): Promise<ServerConfig> {
        const sessionInfo = {
            id: generateId(),
            playTimeMs: gameConfig.playTimeMs,
            gameType: gameConfig.gameType,
        };

        const boardHandler = this.boardGeneratorService.generateBoardHandler(gameConfig.isRandomBonus);
        const reserveHandler = new ReserveHandler();

        const sessionHandler = new SessionHandler(sessionInfo, boardHandler, reserveHandler, new PlayerHandler(), this.socketService);

        const humanPlayerInfo: PlayerInfo = {
            id: generateId(),
            name: gameConfig.playerName,
            isHuman: true,
        };

        const virtualPlayerInfo: PlayerInfo = {
            id: generateId(),
            name: gameConfig.virtualPlayerName,
            isHuman: false,
        };

        const humanPlayer = this.addHumanPlayer(humanPlayerInfo, sessionHandler);
        this.addVirtualPlayer(virtualPlayerInfo, sessionHandler);
        this.sessionHandlingService.addHandler(sessionHandler);

        sessionHandler.start();

        logger.info(`Single player game: ${sessionHandler.sessionInfo.id} initialised`);

        return sessionHandler.getServerConfig(humanPlayer.id);
    }

    async initMultiplayer(gameConfig: MultiplayerCreateConfig): Promise<string> {
        const sessionInfo = {
            id: generateId(),
            playTimeMs: gameConfig.playTimeMs,
            gameType: gameConfig.gameType,
        };

        const boardHandler = this.boardGeneratorService.generateBoardHandler(gameConfig.isRandomBonus);
        const reserveHandler = new ReserveHandler();

        const sessionHandler = new SessionHandler(sessionInfo, boardHandler, reserveHandler, new PlayerHandler(), this.socketService);

        const humanPlayerInfo: PlayerInfo = {
            id: generateId(),
            name: gameConfig.playerName,
            isHuman: true,
        };

        const humanPlayer = this.addHumanPlayer(humanPlayerInfo, sessionHandler);

        this.sessionHandlingService.addHandler(sessionHandler);

        logger.info(`Multiplayer game: ${sessionHandler.sessionInfo.id} initialised`);

        return humanPlayer.id;
    }

    async joinMultiplayer(gameConfig: MultiplayerJoinConfig): Promise<ServerConfig | null> {
        const sessionHandler = this.sessionHandlingService.getHandlerBySessionId(gameConfig.sessionId);
        const waitingPlayer = sessionHandler?.players[0];

        if (sessionHandler == null || waitingPlayer == null || sessionHandler.sessionData.isStarted) {
            return null;
        }

        const humanPlayerInfo: PlayerInfo = {
            id: generateId(),
            name: gameConfig.playerName,
            isHuman: true,
        };

        const humanPlayer = this.addHumanPlayer(humanPlayerInfo, sessionHandler);
        this.sessionHandlingService.updateEntries(sessionHandler);
        sessionHandler.start();

        this.socketService.send('onJoin', sessionHandler.sessionInfo.id, sessionHandler.getServerConfig(waitingPlayer.id));

        logger.info(`Multiplayer game: ${sessionHandler.sessionInfo.id} joined by ${humanPlayerInfo.id}`);

        return sessionHandler.getServerConfig(humanPlayer.id);
    }

    async convert(convertConfig: ConvertConfig): Promise<ServerConfig | null> {
        const handler = this.sessionHandlingService.getHandlerByPlayerId(convertConfig.id);

        if (handler == null) {
            logger.warn(`Cannot convert game to single player mode - playerId: ${convertConfig.id}`);
            return null;
        }

        const virtualPlayerInfo: PlayerInfo = {
            id: generateId(),
            name: convertConfig.virtualPlayerName,
            isHuman: false,
        };

        handler.sessionInfo.gameType = GameType.SinglePlayer;
        this.addVirtualPlayer(virtualPlayerInfo, handler);
        this.sessionHandlingService.updateEntries(handler);

        handler.start();

        logger.info(`Game converted: ${handler.sessionInfo.id}`);

        return handler.getServerConfig(convertConfig.id);
    }

    async abandon(id: string): Promise<boolean> {
        const handler = this.sessionHandlingService.getHandlerByPlayerId(id);
        if (handler == null) {
            logger.warn(`Failed to stop game: ${id}`);
            return false;
        }

        if (handler.sessionData.isStarted && handler.sessionInfo.gameType === GameType.Multiplayer) {
            this.humanToVirtualPlayer(handler, id);
        } else {
            handler.dispose();
            this.sessionHandlingService.removeHandler(id);
            logger.info(`Game disposed: ${id}`);
        }

        return true;
    }

    private humanToVirtualPlayer(handler: SessionHandler, playerId: string): boolean {
        const player = handler.players.find((p) => p.id === playerId) as HumanPlayer;
        if (player) {
            player.skipTurn();
            const newName = player.playerInfo.name + ' Virtuel';
            handler.abandon(playerId);
            this.socketService.send('opponentQuit', handler.sessionInfo.id);
            const virtualPlayerInfo: PlayerInfo = {
                id: generateId(),
                name: newName,
                isHuman: false,
            };
            this.addVirtualPlayer(virtualPlayerInfo, handler, player.playerData);
            logger.info(`Game abandoned: ${playerId}`);
        } else {
            logger.warn(`Failed to convert player after abandon: ${playerId}`);
            return false;
        }
        return true;
    }
    private addHumanPlayer(playerInfo: PlayerInfo, sessionHandler: SessionHandler): HumanPlayer {
        const humanPlayer = new HumanPlayer(playerInfo);
        sessionHandler.addPlayer(humanPlayer);

        return humanPlayer;
    }

    private addVirtualPlayer(playerInfo: PlayerInfo, sessionHandler: SessionHandler, playerData?: PlayerData): VirtualPlayer {
        const virtualPlayer = new VirtualPlayer(playerInfo, this.dictionnaryService);
        if (playerData) {
            virtualPlayer.playerData = playerData;
        }
        sessionHandler.addPlayer(virtualPlayer);

        return virtualPlayer;
    }
}
