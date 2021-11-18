/* eslint-disable dot-notation,@typescript-eslint/no-unused-expressions,no-unused-expressions,max-classes-per-file */
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { expect } from 'chai';
import Sinon, { createSandbox, createStubInstance, SinonSandbox } from 'sinon';
import { Action } from './actions/action';
import { Observable } from 'rxjs';
import { Timer } from '@app/classes/delay';
import { PlayActionEasy } from './virtual-player-easy/actions/play-action-easy';
import { ExchangeAction } from './actions/exchange-action';
import { SkipAction } from './actions/skip-action';
import { PlaceAction } from './actions/place-action';
import { VirtualPlayer } from '@app/classes/player/virtual-player/virtual-player';

class TestAction implements Action {
    maxCallCount = 3;
    callCount = 0;
    execute(): Action | null {
        this.callCount++;
        if (this.callCount >= this.maxCallCount) {
            return null;
        }
        return this;
    }
}

class ActionRunner {
    ranActionCount = 0;

    runAction(action: Action): Action | null {
        this.ranActionCount++;
        return action.execute();
    }
}

class VirtualPlayerTester extends VirtualPlayer {
    actionToReturn: Action;

    constructor(actionRunner: ActionRunner) {
        super((action) => actionRunner.runAction(action), { id: '', name: '', isHuman: false });
    }

    protected nextAction(): Action {
        return this.actionToReturn;
    }
}

const SIZE = 9;

describe('VirtualPlayer', () => {
    let service: VirtualPlayerTester;
    let actionRunner: ActionRunner;
    let reserveHandler: Sinon.SinonStubbedInstance<ReserveHandler>;
    let playAction: Sinon.SinonStubbedInstance<PlayActionEasy>;
    let exchangeAction: Sinon.SinonStubbedInstance<ExchangeAction>;
    let skipAction: Sinon.SinonStubbedInstance<SkipAction>;
    let placeAction: Sinon.SinonStubbedInstance<PlaceAction>;
    let socketHandler: Sinon.SinonStubbedInstance<SocketHandler>;
    let boardHandler: Sinon.SinonStubbedInstance<BoardHandler>;
    let sandboxTimer: SinonSandbox;
    let sandboxNext: SinonSandbox;

    beforeEach(() => {
        reserveHandler = createStubInstance(ReserveHandler);
        playAction = createStubInstance(PlayActionEasy);
        exchangeAction = createStubInstance(ExchangeAction);
        skipAction = createStubInstance(SkipAction);
        placeAction = createStubInstance(PlaceAction);
        socketHandler = createStubInstance(SocketHandler);
        boardHandler = createStubInstance(BoardHandler);

        actionRunner = new ActionRunner();
        service = new VirtualPlayerTester(actionRunner);
        service.init(boardHandler as unknown as BoardHandler, reserveHandler, socketHandler as unknown as SocketHandler);

        reserveHandler['reserve'] = [];

        playAction.execute.returns(placeAction);
        exchangeAction.execute.returns(null);
        skipAction.execute.returns(null);
        placeAction.execute.returns(null);
        sandboxTimer = createSandbox();
        sandboxNext = createSandbox();

        service.actionToReturn = skipAction;
    });

    afterEach(() => {
        sandboxTimer.restore();
        sandboxNext.restore();
    });

    it('should create virtual player', () => {
        expect(service).to.be.ok;
    });

    it('starting turn should fill rack', async () => {
        const sandbox = createSandbox();
        const stubFill = sandbox.stub(service, 'fillRack');
        sandboxTimer.stub(Timer, 'delay').returns(Promise.resolve());
        await service.startTurn();
        sandbox.assert.calledOnce(stubFill);
    });

    it('starting turn should eventually end turn', async () => {
        reserveHandler.reserve.length = SIZE;
        sandboxTimer.stub(Timer, 'delay').returns(Promise.resolve());
        await service.startTurn();
        expect(service.isTurn).to.be.false;
    });

    it('startTurn should execute many actions', async () => {
        const testAction = new TestAction();
        service.actionToReturn = testAction;
        sandboxTimer.stub(Timer, 'delay').returns(Promise.resolve());

        await service['startTurn']();
        expect(actionRunner.ranActionCount).to.be.equal(testAction.maxCallCount);
    });

    it('getting id should return id', () => {
        const returnValue = service.id;
        expect(returnValue).to.eql(service.playerInfo.id);
    });

    it('onTurn should return turnEnded as observable', () => {
        const returnValue = service.onTurn();
        expect(typeof returnValue).to.eql(typeof new Observable<string>());
    });
});
