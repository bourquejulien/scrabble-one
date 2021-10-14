/* eslint-disable no-unused-expressions -- To be */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { Trie } from './trie';

const WORDS: string[] = ['table', 'chaise', 'chat', 'chien'];

describe('Trie', () => {
    let trie: Trie;
    beforeEach(() => {
        trie = new Trie();
    });

    it('should contain added word', () => {
        for (const word of WORDS) {
            trie.insert(word);
        }

        expect(trie.size).to.equal(WORDS.length);
        for (const word of WORDS) {
            expect(trie.contains(word)).to.be.true;
        }
    });

    it('should ignore words added twice', () => {
        for (const word of WORDS) {
            trie.insert(word);
        }
        for (const word of WORDS) {
            trie.insert(word);
        }

        expect(trie.size).to.equal(WORDS.length);

        for (const word of WORDS) {
            expect(trie.contains(word)).to.be.true;
        }
    });

    it('should not contain none present word', () => {
        for (const word of WORDS) {
            trie.insert(word);
        }

        for (const word of WORDS) {
            expect(trie.contains(word + 'x')).to.be.false;
        }
    });

    it('should be able to find word start', () => {
        for (const word of WORDS) {
            trie.insert(word);
        }

        expect(trie.startsWith('cha').isOther).to.be.true;
    });
});
