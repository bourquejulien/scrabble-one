/* eslint-disable no-unused-expressions -- To be */
/* eslint-disable @typescript-eslint/no-unused-expressions  -- To be */
import { expect } from 'chai';
import { SkipAction } from './skip-action';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { createStubInstance } from 'sinon';

describe('SkipAction', () => {
    let socketHandler: SocketHandler;

    beforeEach(() => {
        socketHandler = createStubInstance(SocketHandler) as unknown as SocketHandler;
    });

    it('should return null', () => {
        expect(new SkipAction({ baseScore: 0, scoreAdjustment: 0, skippedTurns: 0, rack: [] }, socketHandler).execute()).to.be.null;
    });
});
