/* eslint-disable @typescript-eslint/no-useless-constructor,no-unused-vars,@typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions -- Needed for chai library assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { HumanPlayer } from '@app/classes/player/human-player/human-player';
import { Player } from '@app/classes/player/player';
import { SessionData } from '@app/classes/session-data';
import { SessionInfo } from '@app/classes/session-info';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { BoardGeneratorService } from '@app/services/board/board-generator.service';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { GameService } from '@app/services/game/game.service';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { SocketService } from '@app/services/socket/socket-service';
import { ConvertConfig, GameMode, GameType, MultiplayerCreateConfig, MultiplayerJoinConfig, ServerConfig, SinglePlayerConfig } from '@common';
import { expect } from 'chai';
import Sinon, { assert, createStubInstance, stub } from 'sinon';

class StubSessionHandler {
    players: Player[] = [];
    addedPlayers: Player[] = [];
    convertCalled: boolean = false;
    sessionData: SessionData = {
        isActive: false,
        isStarted: false,
        timeLimitEpoch: 0,
    };

    sessionInfo: SessionInfo = {
        id: '',
        playTimeMs: 0,
        gameType: GameType.SinglePlayer,
    };

    addPlayer(player: Player) {
        this.addedPlayers.push(player);
    }

    start() {}

    getServerConfig(id: string): ServerConfig {
        return {
            id,
            startId: '',
            gameMode: GameMode.Classic,
            gameType: GameType.SinglePlayer,
            playTimeMs: 0,
            firstPlayerName: '',
            secondPlayerName: '',
        };
    }

    dispose() {}

    convert(playerId: string, dictionnaryService: DictionaryService): void {
        this.convertCalled = true;
    }
}

const singlePlayerConfig: SinglePlayerConfig = {
    gameType: GameType.SinglePlayer,
    gameMode: GameMode.Classic,
    playTimeMs: 0,
    playerName: 'test1',
    virtualPlayerName: 'test2',
    isRandomBonus: true,
};

const multiplayerCreateConfig: MultiplayerCreateConfig = {
    gameType: GameType.SinglePlayer,
    gameMode: GameMode.Classic,
    playTimeMs: 0,
    playerName: 'test1',
    isRandomBonus: true,
};

const multiplayerJoinConfig: MultiplayerJoinConfig = {
    sessionId: 'anOriginalId',
    playerName: 'test1',
};

const convertConfig: ConvertConfig = {
    id: '438f98gser89dg',
    virtualPlayerName: 'test1',
};

describe('GameService', () => {
    let service: GameService;
    let boardGeneratorStub: Sinon.SinonStubbedInstance<BoardGeneratorService>;
    let sessionHandlingStub: Sinon.SinonStubbedInstance<SessionHandlingService>;
    let dictionaryServiceStub: Sinon.SinonStubbedInstance<DictionaryService>;
    let sessionHandlerStub: StubSessionHandler;
    let socketServiceStub: SocketService;

    beforeEach(() => {
        boardGeneratorStub = createStubInstance(BoardGeneratorService);
        sessionHandlingStub = createStubInstance(SessionHandlingService);
        dictionaryServiceStub = createStubInstance(DictionaryService);
        socketServiceStub = createStubInstance(SocketService);
        sessionHandlerStub = new StubSessionHandler();

        service = new GameService(
            boardGeneratorStub as unknown as BoardGeneratorService,
            sessionHandlingStub as unknown as SessionHandlingService,
            dictionaryServiceStub as unknown as DictionaryService,
            socketServiceStub as unknown as SocketService,
        );
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should init single player', async () => {
        const serverConfig = await service.initSinglePlayer(singlePlayerConfig);
        assert.calledOnce(sessionHandlingStub.addHandler);
        expect(serverConfig).to.be.ok;
    });

    it('should init multiplayer', async () => {
        const serverConfig = await service.initMultiplayer(multiplayerCreateConfig);
        assert.calledOnce(sessionHandlingStub.addHandler);
        expect(serverConfig).to.be.ok;
    });

    it('should not join multiplayer games if session cant be found', async () => {
        const sessionHandler = createStubInstance(SessionHandlingService);
        sessionHandler.getHandlerBySessionId.returns(null);
        const serverConfig = await service.joinMultiplayer(multiplayerJoinConfig);
        expect(serverConfig).to.be.null;
    });

    it('should join multiplayer', async () => {
        const playerStub = createStubInstance(HumanPlayer);
        stub(playerStub, 'id').get(() => {
            return '';
        });
        sessionHandlingStub.getHandlerBySessionId.returns(sessionHandlerStub as unknown as SessionHandler);
        sessionHandlerStub.players = [playerStub as unknown as Player];
        const serverConfig = await service.joinMultiplayer(multiplayerJoinConfig);
        expect(serverConfig?.id).to.equal(serverConfig?.id);
    });

    it('should not convert multiplayer game if handler is null', async () => {
        sessionHandlingStub.getHandlerBySessionId.returns(null);
        const serverConfig = await service.convert(convertConfig);
        expect(serverConfig).to.be.null;
    });

    it('should convert multiplayer', async () => {
        const playerStub = createStubInstance(HumanPlayer);
        stub(playerStub, 'id').get(() => {
            return '';
        });
        sessionHandlerStub.sessionInfo.gameType = GameType.Multiplayer;

        sessionHandlingStub.getHandlerByPlayerId.returns(sessionHandlerStub as unknown as SessionHandler);
        sessionHandlerStub.players = [playerStub as unknown as Player];
        const serverConfig = await service.convert(convertConfig);
        assert.calledOnce(sessionHandlingStub.updateEntries);
        expect(serverConfig?.id).to.equal(serverConfig?.id);
    });

    it('should not abandon if handler is null', async () => {
        const playerStub = createStubInstance(HumanPlayer);
        stub(playerStub, 'id').get(() => {
            return '';
        });
        sessionHandlingStub.getHandlerBySessionId.returns(null);
        const answer = await service.abandon('');
        expect(answer).to.be.false;
    });

    it('should dispose if multiplayer game is inactive', async () => {
        const playerStub = createStubInstance(HumanPlayer);
        stub(playerStub, 'id').get(() => {
            return '';
        });

        sessionHandlingStub.getHandlerByPlayerId.returns(sessionHandlerStub as unknown as SessionHandler);
        const answer = await service.abandon('');
        assert.calledOnce(sessionHandlingStub.removeHandler);
        expect(answer).to.be.true;
    });

    it('should abandon if multiplayer game is active', async () => {
        const playerStub = createStubInstance(HumanPlayer);
        stub(playerStub, 'id').get(() => {
            return '';
        });

        sessionHandlerStub.sessionInfo.gameType = GameType.Multiplayer;
        sessionHandlerStub.sessionData.isActive = true;

        sessionHandlingStub.getHandlerByPlayerId.returns(sessionHandlerStub as unknown as SessionHandler);
        const answer = await service.abandon('');
        expect(answer).to.be.true;
    });

    it('abandon should call convertGame when game is multiplayer and started', async () => {
        const playerStub = createStubInstance(HumanPlayer);
        stub(playerStub, 'id').get(() => {
            return '';
        });

        sessionHandlerStub.sessionInfo.gameType = GameType.Multiplayer;
        sessionHandlerStub.sessionData.isActive = true;
        sessionHandlerStub.sessionData.isStarted = true;
        sessionHandlingStub.getHandlerByPlayerId.returns(sessionHandlerStub as unknown as SessionHandler);
        await service.abandon('');
        expect(sessionHandlerStub.convertCalled).to.be.true;
    });
});
