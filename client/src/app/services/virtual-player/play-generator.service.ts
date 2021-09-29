import { Injectable } from '@angular/core';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { BoardService } from '@app/services/board/board.service';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';

@Injectable({
    providedIn: 'root',
})
export class PlayGeneratorService {
    constructor(private readonly dictionaryService: DictionaryService, private readonly boardService: BoardService) {}

    newGenerator(rack: string[]): PlayGenerator {
        return new PlayGenerator(this.boardService.gameBoard, this.dictionaryService, this.boardService, rack);
    }
}
