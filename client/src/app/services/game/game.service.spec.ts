/* eslint-disable max-classes-per-file -- Needs many stubbed classes in order to test*/
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlayerType } from '@app/classes/player-type';
import { Subject } from 'rxjs';
import { PlayerService } from '@app/services/player/player.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { GameService } from './game.service';
import { HttpClientModule } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class MockPlayerService {
    turnComplete: Subject<PlayerType> = new Subject();
    emptyRackMock(): boolean {
        return true;
    }
}

@Injectable({
    providedIn: 'root',
})
export class MockVirtualPlayerService {
    turnComplete: Subject<PlayerType> = new Subject();
}

describe('GameService', () => {
    let service: GameService;
    let playerService: PlayerService;
    let virtualPlayerServiceSpy: jasmine.SpyObj<VirtualPlayerService>;

    beforeEach(() => {
        virtualPlayerServiceSpy = jasmine.createSpyObj('VirtualPlayerService', ['emptyRack', 'turnComplete', 'fillRack', 'startTurn']);
        virtualPlayerServiceSpy.emptyRack.and.returnValue();
        virtualPlayerServiceSpy.fillRack.and.returnValue();
        virtualPlayerServiceSpy.startTurn.and.returnValue();
        virtualPlayerServiceSpy.turnComplete = new Subject<PlayerType>();
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [
                { provide: VirtualPlayerService, useValue: virtualPlayerServiceSpy },
                // { provide: PlayerService, useValue: playerService },
            ],
        });
        playerService = TestBed.inject(PlayerService);
        service = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call EmptyRack, resetReserveNewGame, resetBoard from playerService and emptyrack from virtualPlayer when endGame', () => {
        const spyEmpty = spyOn(playerService, 'emptyRack').and.callThrough();
        const spyResetReserve = spyOn(playerService, 'resetReserveNewGame').and.callThrough();
        const spyResetBoard = spyOn(playerService, 'resetBoard').and.callThrough();
        service.endGame();
        expect(spyEmpty).toHaveBeenCalled();
        expect(spyResetReserve).toHaveBeenCalled();
        expect(spyResetBoard).toHaveBeenCalled();
        expect(virtualPlayerServiceSpy.emptyRack).toHaveBeenCalled();
    });
});
