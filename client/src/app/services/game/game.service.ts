import { Injectable } from '@angular/core';
import { GameConfig } from '@app/classes/game-config';
import { PlayerType } from '@app/classes/player-type';
import { TimeSpan } from '@app/classes/time/timespan';
import { Constants } from '@app/constants/global.constants';
import { PlayerService } from '@app/services/player/player.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    firstPlayerPoints: number = 0;
    secondPlayerPoints: number = 0;
    currentTurn: PlayerType = PlayerType.Local;
    onTurn: BehaviorSubject<PlayerType>;
    gameConfig: GameConfig = {
        gameType: '',
        playTime: TimeSpan.fromSeconds(0),
        firstPlayerName: '',
        secondPlayerName: '',
    };

    constructor(private readonly playerService: PlayerService, private readonly virtualPlayerService: VirtualPlayerService) {
        this.onTurn = new BehaviorSubject<PlayerType>(PlayerType.Local);
        playerService.turnComplete.subscribe((e) => this.handleTurnCompletion(e));
        virtualPlayerService.turnComplete.subscribe((e) => this.handleTurnCompletion(e));
    }

    startGame(gameConfig: GameConfig) {
        this.gameConfig = gameConfig;
        this.currentTurn = this.randomizeTurn();

        this.virtualPlayerService.fillRack();
        this.playerService.fillRack(Constants.MIN_SIZE);
        this.nextTurn();
    }

    endGame() {
        this.playerService.emptyRack();
        this.virtualPlayerService.emptyRack();
        this.playerService.resetReserveNewGame();
        this.playerService.resetBoard();
    }

    nextTurn() {
        this.firstPlayerPoints = this.playerService.points;
        this.secondPlayerPoints = this.virtualPlayerService.points;
        // TODO Use an interface for services
        if (this.currentTurn === PlayerType.Local) {
            this.onVirtualPlayerTurn();
        } else {
            this.onPlayerTurn();
        }
    }

    private handleTurnCompletion(playerType: PlayerType) {
        if (playerType !== this.currentTurn) {
            return;
        }

        this.nextTurn();
    }

    private onPlayerTurn() {
        this.currentTurn = PlayerType.Local;
        this.onTurn.next(this.currentTurn);
        this.playerService.startTurn(this.gameConfig.playTime);
    }

    private onVirtualPlayerTurn() {
        this.currentTurn = PlayerType.Virtual;
        this.onTurn.next(this.currentTurn);
        this.virtualPlayerService.startTurn();
    }

    private randomizeTurn(): PlayerType {
        const HALF = 0.5;
        return Math.random() < HALF ? PlayerType.Local : PlayerType.Virtual;
    }
}
