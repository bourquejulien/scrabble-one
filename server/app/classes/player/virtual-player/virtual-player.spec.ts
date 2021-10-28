/* eslint-disable max-classes-per-file -- Multiple stubs are used */
/*
import { Action } from '@app/classes/virtual-player/actions/action';
import { VirtualPlayer } from '@app/classes/virtual-player/virtual-player';
import { PlayerData } from '@common';
import { createStubInstance } from 'sinon';

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const MAX_PLAYTIME_SECONDS = 20;

class VirtualPlayerActionServiceMock {
    actionCalled: number = 0;
    returnSecondAction = true;

    // eslint-disable-next-line no-unused-vars -- Not needed for testing
    getNextAction(playerData: PlayerData): Action {
        return { execute: () => this.execute() };
    }

    private execute(): Action {
        this.actionCalled++;
        return { execute: this.returnSecondAction ? () => this.execute() : () => null };
    }
}

class ReserveServiceMock {

}

describe('VirtualPlayerService', () => {
    let service: VirtualPlayer;

    beforeEach(() => {
        const virtualPlayerActionServiceMock = createStubInstance(VirtualPlayerActionServiceMock);
        const reserveServiceMock = createStubInstance(ReserveServiceMock);
        service = new VirtualPlayer('test', virtualPlayerActionServiceMock);
    });

}
*/
