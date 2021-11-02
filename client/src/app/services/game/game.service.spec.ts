/* eslint-disable dot-notation -- Need to access private properties for testing*/
/* eslint-disable max-classes-per-file -- Needs many stubbed classes in order to test*/
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PlayerService } from '@app/services/player/player.service';
import { Subject } from 'rxjs';
import { GameService } from './game.service';

// const MAX_LENGTH_RACK = 7;
// const PLAYER_POINTS = 100;

describe('GameService', () => {
    let service: GameService;
    // let reserveService: ReserveService;
    let playerService: jasmine.SpyObj<PlayerService>;
    let mockRack: string[];

    beforeEach(() => {
        mockRack = ['K', 'E', 'S', 'E', 'I', 'O', 'V'];

        playerService = jasmine.createSpyObj('playerService', ['startTurn', 'turnComplete', 'fillRack', 'reset', 'emptyRack'], {
            playerData: { score: 0, skippedTurns: 0, rack: [] },
            rack: mockRack,
            turnComplete: new Subject(),
        });

        playerService.reset.and.returnValue();

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: PlayerService, useValue: playerService }],
        });

        service = TestBed.inject(GameService);
        // reserveService = TestBed.inject(ReserveService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    /*
        it('start should define currentTurn and swap Virtual to Local', async () => {
            const spy = spyOn(Math, 'random').and.returnValue(1);
            await service.startGame(service.gameConfig);
            expect(spy).toHaveBeenCalled();
            expect(service.currentTurn).toBe(PlayerType.Human);
        });

        it('start should define currentTurn and swap from Local to Virtual', async () => {
            const spy = spyOn(Math, 'random').and.returnValue(0);
            await service.startGame(service.gameConfig);
            expect(spy).toHaveBeenCalled();
            expect(service.currentTurn).toBe(PlayerType.Virtual);
        });

        it('should call EmptyRack, resetReserveNewGame, resetBoard from playerService and emptyrack from virtualPlayer when ResetGame', async () => {
            await service.reset();
            expect(playerService.reset).toHaveBeenCalled();
            expect(virtualPlayerServiceSpy.reset).toHaveBeenCalled();
        });

        it('should have the right amount of point when playerRackPoint is called', () => {
            const expectRackPoint = 19;
            const rackPoint = service.playerRackPoint(virtualPlayerServiceSpy.playerData.rack);
            expect(rackPoint).toBe(expectRackPoint);
        });

        it('should reset all player stats to 0 when resetGame is called', async () => {
            await service.reset();
            expect(playerService.playerData.score).toBe(0);
            expect(playerService.playerData.skippedTurns).toBe(0);
        });

        it('should reset all virtualPlayer stats to 0 when resetGame is called', async () => {
            await service.reset();
            expect(virtualPlayerServiceSpy.playerData.skippedTurns).toBe(0);
            expect(virtualPlayerServiceSpy.playerData.score).toBe(0);
        });

        it('should reset skipTurnNb to 0 when resetGame is called', async () => {
            await service.reset();
            expect(service.skipTurnNb).toBe(0);
        });

        it('should end game', () => {
            const spy = spyOn(service, 'endGamePoint');
            reserveService.setReserve([]);
            mockRack.length = 0;
            service.emptyRackAndReserve();
            expect(spy).toHaveBeenCalled();
        });

        it('should end game', () => {
            const spy = spyOn(service, 'endGamePoint');
            reserveService.setReserve([]);
            mockRack.length = 0;
            service.emptyRackAndReserve();
            expect(spy).toHaveBeenCalled();
        });

        it('should set player points to 0', () => {
            service.firstPlayerStats.points = 1;
            playerService.fillRack(MAX_LENGTH_RACK);
            service.endGamePoint();
            expect(playerService.playerData.score).toEqual(0);
        });

        it('should subtracts rack value to ', () => {
            service.firstPlayerStats.points = PLAYER_POINTS;
            playerService.fillRack(MAX_LENGTH_RACK);
            const rackValue = service.playerRackPoint(playerService.rack);
            service.endGamePoint();
            const finalScore = PLAYER_POINTS - rackValue;
            expect(service.firstPlayerStats.points).toEqual(finalScore);
        });

        it('should not next turn', () => {
            const spyNextTurn = spyOn<any>(service, 'nextTurn');
            service['handleTurnCompletion'](PlayerType.Virtual);
            expect(spyNextTurn).not.toHaveBeenCalled();
        });

        it('should next turn', () => {
            const spyNextTurn = spyOn<any>(service, 'nextTurn');
            service['handleTurnCompletion'](PlayerType.Human);
            expect(spyNextTurn).toHaveBeenCalled();
        });

        it('should end game', () => {
            const spy = spyOn(service, 'endGamePoint');
            playerService.playerData.skippedTurns = Constants.MAX_SKIP_TURN + 1;
            virtualPlayerServiceSpy.playerData.skippedTurns = Constants.MAX_SKIP_TURN + 1;
            service.skipTurnLimit();
            expect(spy).toHaveBeenCalled();
        });

        it('should increment skipTurnNb', () => {
            playerService.playerData.skippedTurns = 0;
            service.skipTurn();
            expect(playerService.playerData.skippedTurns).not.toEqual(0);
        });

        it('should not increment skipTurnNb', () => {
            playerService.playerData.skippedTurns = Constants.MAX_SKIP_TURN;
            service.skipTurn();
            expect(playerService.playerData.skippedTurns).toEqual(Constants.MAX_SKIP_TURN);
        });

        it('should send rack', () => {
            const spy = spyOn(service['messaging'], 'send');
            service.sendRackInCommunication();
            expect(spy).toHaveBeenCalledWith(
                'Fin de partie - lettres restantes',
                service.gameConfig.firstPlayerName +
                    ' : ' +
                    service['playerService'].rack +
                    '\n' +
                    service.gameConfig.secondPlayerName +
                    ' : ' +
                    service['virtualPlayerService'].playerData.rack,
                MessageType.System,
            );
        });
        */
});
