// TODO Check if accepted
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-classes-per-file */
class TrieNode {
    readonly character: string;
    readonly isWord: boolean;
    private readonly children: Map<string, TrieNode>;

    constructor(character: string, isWord: boolean) {
        this.children = new Map<string, TrieNode>();
        this.character = character;
        this.isWord = isWord;
    }

    addChildren(node: TrieNode): void {
        this.children.set(node.character, node);
    }

    getChildren(character: string): TrieNode | null {
        return this.children.get(character) ?? null;
    }
}

export interface IReadOnlyTrie {
    contains(word: string): boolean;
    startsWith(word: string): boolean;
    get size(): number;
}

export interface ITrie {
    insert(word: string): void;
    contains(word: string): boolean;
    startsWith(word: string): boolean;
    get size(): number;
}

export class Trie implements ITrie {
    private readonly root: TrieNode;
    private _size: number;

    constructor() {
        this.root = new TrieNode('', false);
        this._size = 0;
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

        this._size++;
    }

    contains(word: string): boolean {
        const node = this.getNode(word);
        return node !== null && node.isWord;
    }

    startsWith(word: string): boolean {
        return this.getNode(word) !== null;
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
        return this._size;
    }
}
