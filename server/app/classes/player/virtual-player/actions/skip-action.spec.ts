/* eslint-disable no-unused-expressions -- To be */
/* eslint-disable @typescript-eslint/no-unused-expressions  -- To be */
import { expect } from 'chai';
import { SkipAction } from './skip-action';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { createStubInstance } from 'sinon';
import { PlayerStatsHandler } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-handler';

describe('SkipAction', () => {
    let socketHandler: SocketHandler;
    let statsHandler: PlayerStatsHandler;

    beforeEach(() => {
        statsHandler = createStubInstance(PlayerStatsHandler) as unknown as PlayerStatsHandler;
        socketHandler = createStubInstance(SocketHandler) as unknown as SocketHandler;
    });

    it('should return null', () => {
        expect(new SkipAction(statsHandler, socketHandler).execute()).to.be.null;
    });
});
