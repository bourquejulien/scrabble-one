/* eslint-disable max-classes-per-file -- Needs many stubbed classes in order to test*/
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlayerData } from '@app/classes/player-data';
import { PlayerType } from '@app/classes/player-type';
import { PlayerService } from '@app/services/player/player.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { Subject } from 'rxjs';
import { GameService } from './game.service';

@Injectable({
    providedIn: 'root',
})
class MockPlayerService {
    turnComplete: Subject<PlayerType> = new Subject<PlayerType>();
    points: number = 0;
    rack: string[] = [];
    fillRack() {
        // Does Nothing
    }
    startTurn() {
        this.turnComplete.next(PlayerType.Virtual);
    }
}

@Injectable({
    providedIn: 'root',
})
class MockVirtualPlayerService {
    turnComplete: Subject<PlayerType> = new Subject();
    playerData: PlayerData = {
        score: 0,
        rack: [],
    };
    fillRack() {
        // Does Nothing
    }
    startTurn() {
        this.turnComplete.next(PlayerType.Virtual);
    }
}

describe('GameService', () => {
    let service: GameService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: VirtualPlayerService, useClass: MockVirtualPlayerService },
                { provide: PlayerService, useClass: MockPlayerService },
            ],
        });
        service = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('start should define currentTurn and swap Virtual to Local', () => {
        const spy = spyOn(Math, 'random').and.returnValue(1);
        service.startGame(service.gameConfig);
        expect(spy).toHaveBeenCalled();
        expect(service.currentTurn).toBe(PlayerType.Local);
    });
    it('start should define currentTurn and come back from Local to Local', () => {
        const spy = spyOn(Math, 'random').and.returnValue(0);
        service.startGame(service.gameConfig);
        expect(spy).toHaveBeenCalled();
        expect(service.currentTurn).toBe(PlayerType.Local);
    });
});
