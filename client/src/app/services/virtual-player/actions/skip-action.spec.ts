import { SkipAction } from './skip-action';

describe('SkipAction', () => {
    it('should return null', () => {
        expect(new SkipAction().execute()).toBeNull();
    });
});
