/* eslint-disable max-classes-per-file -- TrieNode is for internal use only */
class TrieNode {
    readonly character: string;
    readonly isWord: boolean;
    private readonly childrens: TrieNode[];

    constructor(character: string, isWord: boolean) {
        this.childrens = [];
        this.character = character;
        this.isWord = isWord;
    }

    addChildren(node: TrieNode): void {
        this.childrens.push(node);
    }

    getChildren(character: string): TrieNode | null {
        return this.childrens.find((e) => e.character === character) ?? null;
    }

    get hasChildren(): boolean {
        return this.childrens.length !== 0;
    }
}

export interface IReadOnlyTrie {
    contains(word: string): boolean;
    startsWith(word: string): { isWord: boolean; isOther: boolean };
    get size(): number;
}

export interface ITrie {
    insert(word: string): void;
    contains(word: string): boolean;
    startsWith(word: string): { isWord: boolean; isOther: boolean };
    get size(): number;
}

export class Trie implements ITrie {
    private readonly root: TrieNode;
    private length: number;

    constructor() {
        this.root = new TrieNode('', false);
        this.length = 0;
    }

    insert(word: string): void {
        const lastNode = this.getLastNode(word);
        if (lastNode.index === word.length) return;

        let currentNode = lastNode.node;

        for (let index = lastNode.index; index < word.length; index++) {
            const newNode = new TrieNode(word[index], index === word.length - 1);
            currentNode.addChildren(newNode);
            currentNode = newNode;
        }

        this.length++;
    }

    contains(word: string): boolean {
        const node = this.getNode(word);
        return node !== null && node.isWord;
    }

    startsWith(word: string): { isWord: boolean; isOther: boolean } {
        const node = this.getNode(word);
        return { isWord: node !== null && node.isWord, isOther: node !== null && node.hasChildren };
    }

    private getNode(word: string): TrieNode | null {
        const lastNode = this.getLastNode(word);
        return lastNode.index === word.length ? lastNode.node : null;
    }

    private getLastNode(word: string, origin: TrieNode = this.root): { node: TrieNode; index: number } {
        let currentNode: TrieNode = origin;

        for (let index = 0; index < word.length; index++) {
            const node = currentNode.getChildren(word[index]);
            if (node == null) return { node: currentNode, index };
            currentNode = node;
        }

        return { node: currentNode, index: word.length };
    }

    get size(): number {
        return this.length;
    }
}
