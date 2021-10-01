import { SkipAction } from './skip-action';

describe('SkipAction', () => {
    it('should return null', () => {
        expect(new SkipAction({ score: 0, skippedTurns: 0, rack: [] }).execute()).toBeNull();
    });
});
