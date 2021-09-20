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

        expect(trie.size).toEqual(WORDS.length);
        for (const word of WORDS) {
            expect(trie.contains(word)).toBeTrue();
        }
    });

    it('should ignore words added twice', () => {
        for (const word of WORDS) {
            trie.insert(word);
        }
        for (const word of WORDS) {
            trie.insert(word);
        }

        expect(trie.size).toEqual(WORDS.length);

        for (const word of WORDS) {
            expect(trie.contains(word)).toBeTrue();
        }
    });

    it('should not contain none present word', () => {
        for (const word of WORDS) {
            trie.insert(word);
        }

        for (const word of WORDS) {
            expect(trie.contains(word + 'x')).toBeFalse();
        }
    });

    it('should be able to find word start', () => {
        for (const word of WORDS) {
            trie.insert(word);
        }

        expect(trie.startsWith('cha')).toBeTrue();
    });
});
