/* eslint-disable dot-notation -- Need to access private properties for testing*/
/* eslint-disable max-classes-per-file -- Needs many stubbed classes in order to test*/
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MessageType } from '@app/classes/message';
import { PlayerType } from '@app/classes/player-type';
import { Constants } from '@app/constants/global.constants';
import { PlayerService } from '@app/services/player/player.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { Subject } from 'rxjs';
import { GameService } from './game.service';
const MAX_LENGTH_RACK = 7;
const PLAYER_POINTS = 100;
describe('GameService', () => {
    let service: GameService;
    let playerService: PlayerService;
    let reserveService: ReserveService;
    let virtualPlayerServiceSpy: jasmine.SpyObj<VirtualPlayerService>;

    beforeEach(() => {
        const mockRack = ['K', 'E', 'S', 'E', 'I', 'O', 'V'];
        virtualPlayerServiceSpy = jasmine.createSpyObj('VirtualPlayerService', ['reset', 'turnComplete', 'fillRack', 'startTurn'], {
            playerData: { score: 0, skippedTurns: 0, rack: mockRack },
        });
        virtualPlayerServiceSpy.reset.and.returnValue();
        virtualPlayerServiceSpy.fillRack.and.returnValue();
        virtualPlayerServiceSpy.startTurn.and.returnValue(Promise.resolve());
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
        reserveService = TestBed.inject(ReserveService);
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
    it('start should define currentTurn and swap from Local to Virtual', () => {
        const spy = spyOn(Math, 'random').and.returnValue(0);
        service.startGame(service.gameConfig);
        expect(spy).toHaveBeenCalled();
        expect(service.currentTurn).toBe(PlayerType.Virtual);
    });

    it('should call EmptyRack, resetReserveNewGame, resetBoard from playerService and emptyrack from virtualPlayer when ResetGame', () => {
        const spyEmpty = spyOn(playerService, 'emptyRack').and.callThrough();
        const spyResetBoard = spyOn(playerService, 'reset').and.callThrough();
        service.reset();
        expect(spyEmpty).toHaveBeenCalled();
        expect(spyResetBoard).toHaveBeenCalled();
        expect(virtualPlayerServiceSpy.reset).toHaveBeenCalled();
    });
    it('should have the right amount of point when playerRackPoint is called', () => {
        const expectRackPoint = 19;
        const virRackPoint = service.playerRackPoint(virtualPlayerServiceSpy.playerData.rack);
        const plaRackPoint = service.playerRackPoint(playerService.rackContent);
        expect(virRackPoint).toBe(expectRackPoint);
        expect(plaRackPoint).toBe(expectRackPoint);
    });
    it('should reset all player stats to 0 when resetGame is called', () => {
        service.reset();
        expect(playerService.points).toBe(0);
        expect(playerService.skipTurnNb).toBe(0);
    });
    it('should reset all virtualPlayer stats to 0 when resetGame is called', () => {
        service.reset();
        expect(virtualPlayerServiceSpy.playerData.skippedTurns).toBe(0);
        expect(virtualPlayerServiceSpy.playerData.score).toBe(0);
    });
    it('should reset skipTurnNb to 0 when resetGame is called', () => {
        service.reset();
        expect(service.skipTurnNb).toBe(0);
    });
    it('should end game', () => {
        const spy = spyOn(service, 'endGamePoint');
        reserveService.setReserve([]);
        playerService.setRack([]);
        service.emptyRackAndReserve();
        expect(spy).toHaveBeenCalled();
    });
    it('should end game', () => {
        const spy = spyOn(service, 'endGamePoint');
        reserveService.setReserve([]);
        virtualPlayerServiceSpy.playerData.rack = [];
        service.emptyRackAndReserve();
        expect(spy).toHaveBeenCalled();
    });
    it('should set player points to 0', () => {
        service.firstPlayerStats.points = 1;
        playerService.fillRack(MAX_LENGTH_RACK);
        service.endGamePoint();
        expect(playerService.points).toEqual(0);
    });
    it('should set virtual player points to 0', () => {
        service.secondPlayerStats.points = 1;
        virtualPlayerServiceSpy.fillRack();
        service.endGamePoint();
        expect(virtualPlayerServiceSpy.playerData.score).toEqual(0);
    });
    it('should substracts rack value to ', () => {
        service.firstPlayerStats.points = PLAYER_POINTS;
        playerService.fillRack(MAX_LENGTH_RACK);
        const rackValue = service.playerRackPoint(playerService.rack);
        service.endGamePoint();
        const finalScore = PLAYER_POINTS - rackValue;
        expect(service.firstPlayerStats.points).toEqual(finalScore);
    });
    it('should not next turn', () => {
        const spyNextTurn = spyOn(service, 'nextTurn');
        service['handleTurnCompletion'](PlayerType.Virtual);
        expect(spyNextTurn).not.toHaveBeenCalled();
    });
    it('should next turn', () => {
        const spyNextTurn = spyOn(service, 'nextTurn');
        service['handleTurnCompletion'](PlayerType.Local);
        expect(spyNextTurn).toHaveBeenCalled();
    });
    it('should end game', () => {
        const spy = spyOn(service, 'endGamePoint');
        playerService.skipTurnNb = Constants.MAX_SKIP_TURN + 1;
        virtualPlayerServiceSpy.playerData.skippedTurns = Constants.MAX_SKIP_TURN + 1;
        service.skipTurnLimit();
        expect(spy).toHaveBeenCalled();
    });
    it('should increment skipTurnNb', () => {
        playerService.skipTurnNb = 0;
        service.skipTurn();
        expect(playerService.skipTurnNb).not.toEqual(0);
    });
    it('should not increment skipTurnNb', () => {
        playerService.skipTurnNb = Constants.MAX_SKIP_TURN;
        service.skipTurn();
        expect(playerService.skipTurnNb).toEqual(Constants.MAX_SKIP_TURN);
    });
    it('shoould send rack', () => {
        const spy = spyOn(service['messaging'], 'send');
        service.sendRackInCommunication();
        expect(spy).toHaveBeenCalledWith(
            'Fin de partie - lettres restantes',
            service.gameConfig.firstPlayerName +
                ' : ' +
                service.gameConfig.firstPlayerName +
                service['playerService'].rack +
                ' ' +
                service.gameConfig.firstPlayerName +
                service.gameConfig.secondPlayerName +
                ' : ' +
                service.gameConfig.firstPlayerName +
                service['virtualPlayerService'].playerData.rack,
            MessageType.System,
        );
    });
});
