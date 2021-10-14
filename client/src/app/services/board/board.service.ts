import { Injectable } from '@angular/core';
import { BoardData, Direction, Vec2, ValidationResponse } from '@common';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class BoardService {
    constructor(private readonly httpClient: HttpClient) {}

    get gameBoard(): BoardData {
        return this.board;
    }

    lookupLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse {
        return this.validator.validate(letters);
    }

    placeLetters(letters: { letter: string; position: Vec2 }[]): ValidationResponse {
        const response = this.validator.validate(letters);

        if (!response.isSuccess) return response;

        this.board.merge(letters);

        return response;
    }

    retrieveNewLetters(word: string, initialPosition: Vec2, direction: Direction): { letter: string; position: Vec2 }[] {
        const newLetters: { letter: string; position: Vec2 }[] = [];



        return newLetters;
    }
}
