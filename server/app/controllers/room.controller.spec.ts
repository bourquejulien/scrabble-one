/* eslint-disable max-classes-per-file */
import { expect } from 'chai';
import { RoomController } from './room.controller';
class StubSocketService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketServer: any;
    init() {
        return;
    }

    send() {
        return;
    }
}
class StubSessionHandlingService {
    playerIds: string[] = [];
    removeHandler() {
        return;
    }

    getHandler() {
        return;
    }

    addHandler() {
        return;
    }

    getSessionId(sessionId: string) {
        return this.playerIds.at(this.playerIds.indexOf(sessionId));
    }
}
describe('RoomController', () => {
    let roomController: RoomController;
    let stubSocketService: StubSocketService;
    let stubSessionHandlingService: StubSessionHandlingService;
    beforeEach(() => {
        stubSessionHandlingService = new StubSessionHandlingService();
        stubSocketService = new StubSocketService();
        roomController = new RoomController(stubSocketService, stubSessionHandlingService);
    });

    it('should be created', () => {
        expect(roomController).to.be.ok;
    });
})
