/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import { expect } from 'chai';
import { RoomController } from './room.controller';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { SocketService } from '@app/services/socket-service';

describe('RoomController', () => {
    let roomController: RoomController;

    beforeEach(() => {
        const stubSocketService: SinonStubbedInstance<SocketService> = createStubInstance(SocketService);
        // eslint-disable-next-line max-len
        const stubSessionHandlingService = createStubInstance(SessionHandlingService) as unknown as SessionHandlingService;
        roomController = new RoomController(stubSocketService, stubSessionHandlingService);
    });

    it('should be created', () => {
        expect(roomController).to.be.ok;
    });
});
