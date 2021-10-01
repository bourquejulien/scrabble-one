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
        const mockRack = ['K', 'E', 'S', 'E', 'I', 'O', 'V'];
        virtualPlayerServiceSpy = jasmine.createSpyObj('VirtualPlayerService', ['emptyRack', 'turnComplete', 'fillRack', 'startTurn'], {
            rackContent: mockRack,
        });
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
        playerService.setRack(mockRack);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call EmptyRack, resetReserveNewGame, resetBoard from playerService and emptyrack from virtualPlayer when ResetGame', () => {
        const spyEmpty = spyOn(playerService, 'emptyRack').and.callThrough();
        const spyResetReserve = spyOn(playerService, 'resetReserveNewGame').and.callThrough();
        const spyResetBoard = spyOn(playerService, 'resetBoard').and.callThrough();
        service.resetGame();
        expect(spyEmpty).toHaveBeenCalled();
        expect(spyResetReserve).toHaveBeenCalled();
        expect(spyResetBoard).toHaveBeenCalled();
        expect(virtualPlayerServiceSpy.emptyRack).toHaveBeenCalled();
    });

    it('should have the right amount of point when playerRackPoint is called', () => {
        const expectRackPoint = 19;
        const virRackPoint = service.playerRackPoint(virtualPlayerServiceSpy.rackContent);
        const plaRackPoint = service.playerRackPoint(playerService.rackContent);
        expect(virRackPoint).toBe(expectRackPoint);
        expect(plaRackPoint).toBe(expectRackPoint);
    });

    it('should reset all player stats to 0 when resetGame is called', () => {
        service.resetGame();
        expect(playerService.points).toBe(0);
        expect(playerService.skipTurnNb).toBe(0);
    });

    it('should reset all virtualPlayer stats to 0 when resetGame is called', () => {
        service.resetGame();
        expect(virtualPlayerServiceSpy.skipTurnNb).toBe(0);
        expect(virtualPlayerServiceSpy.points).toBe(0);
    });

    it('should reset skipTurnNb to 0 when resetGame is called', () => {
        service.resetGame();
        expect(service.skipTurnNb).toBe(0);
    });
});
