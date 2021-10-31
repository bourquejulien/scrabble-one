/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { SocketService } from '@app/services/socket/socket-service';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { SocketHandler } from './socket-handler';

describe('SocketHandler', () => {
    let handler: SocketHandler;

    before(() => {
        const stubSocketService: SinonStubbedInstance<SocketService> = createStubInstance(SocketService);
        handler = new SocketHandler(stubSocketService);
    });

    it('should be created', () => {
        expect(handler).to.be.ok;
    });
});
