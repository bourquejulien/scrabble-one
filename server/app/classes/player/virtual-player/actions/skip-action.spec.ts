/* eslint-disable no-unused-expressions -- To be */
/* eslint-disable @typescript-eslint/no-unused-expressions  -- To be */
import { expect } from 'chai';
import { SkipAction } from './skip-action';

describe('SkipAction', () => {
    it('should return null', () => {
        expect(new SkipAction({ baseScore: 0, scoreAdjustment: 0, skippedTurns: 0, rack: [] }).execute()).to.be.null;
    });
});
