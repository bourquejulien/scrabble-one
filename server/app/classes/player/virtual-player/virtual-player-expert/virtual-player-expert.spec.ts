/* eslint-disable @typescript-eslint/no-unused-expressions,no-unused-expressions,dot-notation */
import { PlayerInfo } from '@app/classes/player-info';
import { expect } from 'chai';
import Sinon, { createStubInstance } from 'sinon';
import { VirtualPlayerExpert } from '@app/classes/player/virtual-player/virtual-player-expert/virtual-player-expert';
import { Action } from '@app/classes/player/virtual-player/actions/action';
import { PlayActionExpert } from '@app/classes/player/virtual-player/virtual-player-expert/actions/play-action-expert';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { Board } from '@app/classes/board/board';
import { DictionaryHandler } from '@app/handlers/dictionary-handler/dictionary-handler';

const BOARD_SIZE = 15;

describe('VirtualPlayer', () => {
    let service: VirtualPlayerExpert;

    let dictionaryHandler: Sinon.SinonStubbedInstance<DictionaryHandler>;
    let reserveHandler: Sinon.SinonStubbedInstance<ReserveHandler>;
    let socketHandler: Sinon.SinonStubbedInstance<SocketHandler>;
    let boardHandler: Sinon.SinonStubbedInstance<BoardHandler>;

    let playerInfo: PlayerInfo = { id: 'test', name: 'mauricetest', isHuman: false };
    let runAction: (action: Action) => Action | null;

    beforeEach(() => {
        dictionaryHandler = createStubInstance(DictionaryHandler);
        reserveHandler = createStubInstance(ReserveHandler);
        socketHandler = createStubInstance(SocketHandler);
        boardHandler = createStubInstance(BoardHandler);
        playerInfo = { id: 'test', name: 'mauricetest', isHuman: false };
        runAction = () => null;

        boardHandler['board'] = new Board(BOARD_SIZE);

        service = new VirtualPlayerExpert(dictionaryHandler as unknown as DictionaryHandler, playerInfo, runAction);
        service.init(boardHandler as unknown as BoardHandler, reserveHandler, socketHandler as unknown as SocketHandler);
    });

    it('should create', () => {
        expect(service).to.be.ok;
    });

    it('should return PlayActionExpert', () => {
        expect(service['nextAction']()).to.be.instanceof(PlayActionExpert);
    });
});
