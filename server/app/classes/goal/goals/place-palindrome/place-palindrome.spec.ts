import { describe } from 'mocha';
import { expect } from 'chai';
import { Goal } from '@app/classes/goal/base-goal';
import { PlacePalindrome } from '@app/classes/goal/goals/place-palindrome/place-palindrome';

describe('PlacePalindrome', () => {
    let goal: Goal;
    beforeEach(() => {
        goal = PlacePalindrome.generate('id');
    });

    it('should be created', () => {
        expect(goal).to.be.ok;
    });
});
