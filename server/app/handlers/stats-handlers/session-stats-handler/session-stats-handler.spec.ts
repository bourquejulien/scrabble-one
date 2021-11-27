/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { describe } from 'mocha';
import { expect } from 'chai';
import { SessionStatsHandler } from '@app/handlers/stats-handlers/session-stats-handler/session-stats-handler';
import { GoalHandler } from '@app/handlers/goal-handler/goal-handler';
import { createStubInstance } from 'sinon';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';

describe('SessionStatsHandler', () => {
    let handler: SessionStatsHandler;
    let goalHandler: GoalHandler;
    let socketHandler: SocketHandler;
    let reserveHandler: ReserveHandler;

    beforeEach(() => {
        socketHandler = createStubInstance(SocketHandler) as unknown as SocketHandler;
        goalHandler = createStubInstance(GoalHandler) as unknown as GoalHandler;
        reserveHandler = createStubInstance(ReserveHandler) as unknown as ReserveHandler;
        handler = new SessionStatsHandler(socketHandler, reserveHandler, goalHandler);
    });

    it('should be created', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(handler).to.be.ok;
    });
});
