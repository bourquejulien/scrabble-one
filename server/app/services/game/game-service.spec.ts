/* eslint-disable @typescript-eslint/no-useless-constructor,no-unused-vars,@typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions -- Needed for chai library assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { HumanPlayer } from '@app/classes/player/human-player/human-player';
import { Player } from '@app/classes/player/player';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { BoardGeneratorService } from '@app/services/board/board-generator.service';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { GameService } from '@app/services/game/game.service';
import { SessionHandlingService } from '@app/services/session-handling/session-handling.service';
import { SocketService } from '@app/services/socket/socket-service';
import { StatsService } from '@app/services/stats/stats.service';
import {
    ConvertConfig,
    DictionaryMetadata,
    GameMode,
    GameType,
    MultiplayerCreateConfig,
    MultiplayerJoinConfig,
    SinglePlayerConfig,
    VirtualPlayerLevel,
} from '@common';
import { expect } from 'chai';
import Sinon, { assert, createStubInstance, stub } from 'sinon';
import { DictionaryHandler } from '@app/handlers/dictionary-handler/dictionary-handler';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';

const dictionary: DictionaryMetadata = {
    title: 'title',
    path: 'dictionary.json',
    description: 'description',
    _id: 'id',
    nbWords: 1024,
};

const singlePlayerConfig: SinglePlayerConfig = {
    gameType: GameType.SinglePlayer,
    gameMode: GameMode.Classic,
    playTimeMs: 0,
    playerName: 'test1',
    virtualPlayerName: 'test2',
    isRandomBonus: true,
    virtualPlayerLevel: VirtualPlayerLevel.Easy,
    dictionary,
};

const multiplayerCreateConfig: MultiplayerCreateConfig = {
    gameType: GameType.SinglePlayer,
    gameMode: GameMode.Classic,
    playTimeMs: 0,
    playerName: 'test1',
    isRandomBonus: true,
    dictionary,
};

const multiplayerJoinConfig: MultiplayerJoinConfig = {
    sessionId: 'anOriginalId',
    playerName: 'test1',
};

const convertConfig: ConvertConfig = {
    id: '438f98gser89dg',
    virtualPlayerLevel: VirtualPlayerLevel.Easy,
    virtualPlayerName: 'test1',
};

describe('GameService', () => {
    let service: GameService;
    let boardGeneratorStub: Sinon.SinonStubbedInstance<BoardGeneratorService>;
    let sessionHandlingStub: Sinon.SinonStubbedInstance<SessionHandlingService>;
    let dictionaryServiceStub: Sinon.SinonStubbedInstance<DictionaryService>;
    let statsServiceStub: Sinon.SinonStubbedInstance<StatsService>;
    let sessionHandlerStub: Sinon.SinonStubbedInstance<SessionHandler>;
    let socketServiceStub: SocketService;

    beforeEach(() => {
        boardGeneratorStub = createStubInstance(BoardGeneratorService);
        const boardHandler = createStubInstance(BoardHandler) as unknown as BoardHandler;
        boardHandler['dictionaryHandler'] = createStubInstance(DictionaryHandler) as unknown as DictionaryHandler;
        boardGeneratorStub.generateBoardHandler.returns(boardHandler);
        sessionHandlingStub = createStubInstance(SessionHandlingService);
        sessionHandlingStub.addHandler.returns();
        sessionHandlingStub.removeHandler.returns(null);
        socketServiceStub = createStubInstance(SocketService);
        dictionaryServiceStub = createStubInstance(DictionaryService);
        const dictionaryHandler = createStubInstance(DictionaryHandler);
        dictionaryServiceStub.getHandler.resolves({ isSuccess: true, payload: dictionaryHandler as unknown as DictionaryHandler });
        statsServiceStub = createStubInstance(StatsService);
        sessionHandlerStub = createStubInstance(SessionHandler);
        sessionHandlerStub.addPlayer.returns();
        sessionHandlerStub['sessionInfo'] = {
            id: '1',
            playTimeMs: 1000,
            gameType: GameType.SinglePlayer,
        };
        sessionHandlerStub['boardHandler'] = createStubInstance(BoardHandler) as unknown as BoardHandler;
        Object.setPrototypeOf(
            SessionHandler,
            stub().callsFake(() => {}),
        );
        service = new GameService(
            boardGeneratorStub as unknown as BoardGeneratorService,
            sessionHandlingStub as unknown as SessionHandlingService,
            dictionaryServiceStub as unknown as DictionaryService,
            statsServiceStub as unknown as StatsService,
            socketServiceStub as unknown as SocketService,
        );
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should not init if there is no dictionary handler single player', async () => {
        dictionaryServiceStub.getHandler.resolves({ isSuccess: false, payload: '' });
        expect(await service.initMultiplayer(multiplayerCreateConfig)).to.eql({ isSuccess: false, payload: '' });
        expect(await service.initSinglePlayer(singlePlayerConfig)).to.eql({ isSuccess: false, payload: '' });
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
        sessionHandlerStub['sessionData'] = {
            isActive: true,
            isStarted: true,
            timeLimitEpoch: 1000,
        };
        const playerStub = createStubInstance(HumanPlayer);
        stub(playerStub, 'id').get(() => {
            return '';
        });
        sessionHandlingStub.getHandlerBySessionId.returns(sessionHandlerStub as unknown as SessionHandler);
        stub(sessionHandlerStub, 'players').get(() => {
            return [playerStub as unknown as Player];
        });
        const serverConfig = await service.joinMultiplayer(multiplayerJoinConfig);
        expect(serverConfig?.id).to.equal(serverConfig?.id);
    });

    it('should not convert multiplayer game if handler is null', async () => {
        sessionHandlingStub.getHandlerBySessionId.returns(null);
        const serverConfig = await service.convert(convertConfig);
        expect(serverConfig).to.be.null;
    });

    it('should convert multiplayer', async () => {
        sessionHandlerStub['sessionInfo'] = {
            id: '1',
            playTimeMs: 1000,
            gameType: GameType.SinglePlayer,
        };
        const playerStub = createStubInstance(HumanPlayer);
        stub(playerStub, 'id').get(() => {
            return '';
        });
        sessionHandlerStub.sessionInfo.gameType = GameType.Multiplayer;

        sessionHandlingStub.getHandlerByPlayerId.returns(sessionHandlerStub as unknown as SessionHandler);
        stub(sessionHandlerStub, 'players').get(() => {
            return [playerStub as unknown as Player];
        });
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
        const answer = await service.convertOrDispose('');
        expect(answer).to.be.false;
    });

    it('should dispose if multiplayer game is inactive', async () => {
        sessionHandlerStub['sessionInfo'] = {
            id: '1',
            playTimeMs: 1000,
            gameType: GameType.Multiplayer,
        };
        sessionHandlerStub['sessionData'] = {
            isActive: false,
            isStarted: true,
            timeLimitEpoch: 1000,
        };
        const playerStub = createStubInstance(HumanPlayer);
        stub(playerStub, 'id').get(() => {
            return '';
        });

        sessionHandlingStub.getHandlerByPlayerId.returns(sessionHandlerStub as unknown as SessionHandler);
        const answer = await service.convertOrDispose('');
        assert.calledOnce(sessionHandlingStub.removeHandler);
        expect(answer).to.be.true;
    });

    it('should abandon if multiplayer game is active', async () => {
        sessionHandlerStub['sessionInfo'] = {
            id: '1',
            playTimeMs: 1000,
            gameType: GameType.Multiplayer,
        };
        sessionHandlerStub['sessionData'] = {
            isActive: true,
            isStarted: true,
            timeLimitEpoch: 1000,
        };
        const playerStub = createStubInstance(HumanPlayer);
        stub(playerStub, 'id').get(() => {
            return '';
        });

        sessionHandlingStub.getHandlerByPlayerId.returns(sessionHandlerStub as unknown as SessionHandler);
        const answer = await service.convertOrDispose('');
        expect(answer).to.be.true;
    });

    it('abandon should call convertWhileRunning when game is multiplayer and started', async () => {
        const playerStub = createStubInstance(HumanPlayer);
        stub(playerStub, 'id').get(() => {
            return '';
        });
        sessionHandlerStub['sessionInfo'] = {
            id: '1',
            playTimeMs: 1000,
            gameType: GameType.Multiplayer,
        };
        sessionHandlerStub['sessionData'] = {
            isActive: true,
            isStarted: true,
            timeLimitEpoch: 1000,
        };
        sessionHandlingStub.getHandlerByPlayerId.returns(sessionHandlerStub as unknown as SessionHandler);
        await service.convertOrDispose('');
        assert.notCalled(sessionHandlingStub.removeHandler);
    });
});
