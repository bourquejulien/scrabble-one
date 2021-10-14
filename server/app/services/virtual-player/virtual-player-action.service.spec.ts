/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Board } from '@app/classes/board/board';
import { PlayerData } from '@app/classes/player-data';
import { Constants } from '@app/constants/global.constants';
import { BoardService } from '@app/services/board/board.service';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ExchangeAction } from './actions/exchange-action';
import { PlayAction } from './actions/play-action';
import { SkipAction } from './actions/skip-action';
import { VirtualPlayerActionService } from './virtual-player-action.service';

@Injectable({
    providedIn: 'root',
})
class BoardServiceStub {
    gameBoard = new Board(Constants.GRID.GRID_SIZE);
}

describe('VirtualPlayerActionService', () => {
    let service: VirtualPlayerActionService;
    let playerData: PlayerData;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: BoardService, useClass: BoardServiceStub },
                { provide: TimerService, useValue: {} },
                { provide: ReserveService, useValue: {} },
                { provide: DictionaryService, useValue: {} },
            ],
        });

        playerData = { score: 0, skippedTurns: 0, rack: [] };
        service = TestBed.inject(VirtualPlayerActionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return SkipAction', () => {
        spyOn(Math, 'random').and.returnValue(0);
        expect(service.getNextAction(playerData)).toBeInstanceOf(SkipAction);
    });

    it('should return ExchangeAction', () => {
        spyOn(Math, 'random').and.returnValue(Constants.virtualPlayer.SKIP_PERCENTAGE);
        expect(service.getNextAction(playerData)).toBeInstanceOf(ExchangeAction);
    });

    it('should return PlayAction', () => {
        spyOn(Math, 'random').and.returnValue(Constants.virtualPlayer.SKIP_PERCENTAGE + Constants.virtualPlayer.EXCHANGE_PERCENTAGE);
        expect(service.getNextAction(playerData)).toBeInstanceOf(PlayAction);
    });
});
