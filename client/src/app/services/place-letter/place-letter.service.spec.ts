import { TestBed } from '@angular/core/testing';
// import { BoardService } from '@app/services/board/board.service';
import { GridService } from '@app/services/grid/grid.service';
import { PlayerService } from '@app/services/player/player.service';
import { RackService } from '@app/services/rack/rack.service';
import { PlaceLetterService } from './place-letter.service';
class RackServiceStub {}
fdescribe('PlaceLetterService', () => {
    let service: PlaceLetterService;
    // let boardService: BoardService;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let gridServiceSpy: jasmine.SpyObj<GridService>;

    beforeEach(() => {
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['placeLetters']);
        gridServiceSpy = jasmine.createSpyObj('GridService', [
            'clearSquare',
            'cleanInsideSquare0',
            'drawSelectionSquare',
            'drawDirectionArrow',
            'resetCanvas',
        ]);
        TestBed.configureTestingModule({
            providers: [
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: GridService, useValue: gridServiceSpy },
                { provide: RackService, useValue: RackServiceStub },
            ],
        });
        service = TestBed.inject(PlaceLetterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
