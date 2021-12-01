import { generateId } from '@app/classes/id';
import { PlayerInfo } from '@app/classes/player-info';
import { HumanPlayer } from '@app/classes/player/human-player/human-player';
import { Action } from '@app/classes/player/virtual-player/actions/action';
import { VirtualPlayer } from '@app/classes/player/virtual-player/virtual-player';
import { DisabledGoalHandler } from '@app/handlers/goal-handler/disabled-goal-handler';
import { Log2990GoalHandler } from '@app/handlers/goal-handler/log2990-goal-handler';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { BoardGeneratorService } from '@app/services/board/board-generator.service';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { SocketService } from '@app/services/socket/socket-service';
import { StatsService } from '@app/services/stats/stats.service';
import { VirtualPlayerExpert } from '@app/classes/player/virtual-player/virtual-player-expert/virtual-player-expert';
import { Service } from 'typedi';
import * as logger from 'winston';
import { SessionInfo } from '@app/classes/session-info';
import { GoalHandler } from '@app/handlers/goal-handler/goal-handler';
import { SessionStatsHandler } from '@app/handlers/stats-handlers/session-stats-handler/session-stats-handler';
import { VirtualPlayerEasy } from '@app/classes/player/virtual-player/virtual-player-easy/virtual-player-easy';
import { SessionHandlingService } from '@app/services/session-handling/session-handling.service';
import {
    ConvertConfig,
    GameMode,
    GameType,
    MultiplayerCreateConfig,
    MultiplayerJoinConfig,
    ServerConfig,
    SinglePlayerConfig,
    VirtualPlayerLevel,
} from '@common';

@Service()
export class GameService {
    constructor(
        private readonly boardGeneratorService: BoardGeneratorService,
        private readonly sessionHandlingService: SessionHandlingService,
        private readonly dictionaryService: DictionaryService,
        private readonly statsService: StatsService,
        private readonly socketService: SocketService,
    ) {}

    async initSinglePlayer(gameConfig: SinglePlayerConfig): Promise<ServerConfig | null> {
        const sessionInfo: SessionInfo = {
            id: generateId(),
            playTimeMs: gameConfig.playTimeMs,
            gameType: gameConfig.gameType,
        };

        // TODO add a construction service?
        const dictionaryHandler = await this.dictionaryService.getHandler(gameConfig.dictionary._id);

        // TODO
        if (dictionaryHandler === null) {
            return null;
        }

        const boardHandler = this.boardGeneratorService.generateBoardHandler(gameConfig.isRandomBonus, dictionaryHandler);
        const reserveHandler = new ReserveHandler();
        const socketHandler = this.socketService.generate(sessionInfo.id);
        const statsHandler = new SessionStatsHandler(socketHandler, reserveHandler, this.getGoalHandler(gameConfig.gameMode));

        const sessionHandler = new SessionHandler(sessionInfo, boardHandler, reserveHandler, new PlayerHandler(), socketHandler, statsHandler);

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
        this.addVirtualPlayer(gameConfig.virtualPlayerLevel, virtualPlayerInfo, sessionHandler);
        this.sessionHandlingService.addHandler(sessionHandler);

        sessionHandler.sessionData.isActive = true;

        logger.info(`Single player game: ${sessionHandler.sessionInfo.id} initialised`);

        return sessionHandler.getServerConfig(humanPlayer.id);
    }

    async initMultiplayer(gameConfig: MultiplayerCreateConfig): Promise<string> {
        const sessionInfo: SessionInfo = {
            id: generateId(),
            playTimeMs: gameConfig.playTimeMs,
            gameType: gameConfig.gameType,
        };

        // TODO add a construction service?
        const dictionaryHandler = await this.dictionaryService.getHandler(gameConfig.dictionary._id);

        // TODO
        if (dictionaryHandler === null) {
            return '';
        }

        const boardHandler = this.boardGeneratorService.generateBoardHandler(gameConfig.isRandomBonus, dictionaryHandler);
        const reserveHandler = new ReserveHandler();
        const socketHandler = this.socketService.generate(sessionInfo.id);
        const statsHandler = new SessionStatsHandler(socketHandler, reserveHandler, this.getGoalHandler(gameConfig.gameMode));

        const sessionHandler = new SessionHandler(sessionInfo, boardHandler, reserveHandler, new PlayerHandler(), socketHandler, statsHandler);

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
        sessionHandler.sessionData.isActive = true;

        this.socketService.send('onJoin', waitingPlayer.id, sessionHandler.getServerConfig(waitingPlayer.id));

        logger.info(`Multiplayer game: ${sessionHandler.sessionInfo.id} joined by ${humanPlayerInfo.id}`);

        return sessionHandler.getServerConfig(humanPlayer.id);
    }

    async convert(convertConfig: ConvertConfig): Promise<ServerConfig | null> {
        const handler = this.sessionHandlingService.getHandlerByPlayerId(convertConfig.id);

        if (handler == null || handler.sessionInfo.gameType !== GameType.Multiplayer) {
            logger.warn(`Cannot convert game to single player mode - playerId: ${convertConfig.id}`);
            return null;
        }

        const virtualPlayerInfo: PlayerInfo = {
            id: generateId(),
            name: convertConfig.virtualPlayerName,
            isHuman: false,
        };

        handler.sessionInfo.gameType = GameType.SinglePlayer;
        this.addVirtualPlayer(convertConfig.virtualPlayerLevel, virtualPlayerInfo, handler);
        this.sessionHandlingService.updateEntries(handler);

        handler.start();

        logger.info(`Game converted: ${handler.sessionInfo.id}`);

        return handler.getServerConfig(convertConfig.id);
    }

    async convertOrDispose(id: string): Promise<boolean> {
        logger.debug(`Abandon - PlayerId: ${id}`);
        const handler = this.sessionHandlingService.getHandlerByPlayerId(id);

        if (handler == null) {
            logger.warn(`Failed to abandon game: ${id}`);
            return false;
        }

        if (handler.sessionData.isStarted && handler.sessionData.isActive && handler.sessionInfo.gameType === GameType.Multiplayer) {
            logger.info(`Converting player: ${id}`);
            handler.convertWhileRunning(id);
            return true;
        }

        const endGameData = handler.dispose();
        this.statsService.updateScoreboards(endGameData);
        this.sessionHandlingService.removeHandler(id);

        logger.info(`Game disposed: ${id}`);

        return true;
    }

    private addHumanPlayer(playerInfo: PlayerInfo, sessionHandler: SessionHandler): HumanPlayer {
        const humanPlayer = new HumanPlayer(playerInfo);
        sessionHandler.addPlayer(humanPlayer);

        return humanPlayer;
    }

    private addVirtualPlayer(virtualPlayerLevel: VirtualPlayerLevel, playerInfo: PlayerInfo, sessionHandler: SessionHandler): VirtualPlayer {
        const actionCallback = (action: Action): Action | null => action.execute();

        const virtualPlayer =
            virtualPlayerLevel === VirtualPlayerLevel.Easy
                ? new VirtualPlayerEasy(sessionHandler.boardHandler.dictionaryHandler, playerInfo, actionCallback)
                : new VirtualPlayerExpert(sessionHandler.boardHandler.dictionaryHandler, playerInfo, actionCallback);

        sessionHandler.addPlayer(virtualPlayer);

        return virtualPlayer;
    }

    private getGoalHandler(gameMode: GameMode): GoalHandler {
        return gameMode === GameMode.Classic ? new DisabledGoalHandler() : new Log2990GoalHandler();
    }
}
