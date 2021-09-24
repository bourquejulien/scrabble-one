import { Injectable } from '@angular/core';
import { GameConfig } from '@app/classes/game-config';
import { PlayerType } from '@app/classes/player-type';
import { Constants } from '@app/constants/global.constants';
import { PlayerService } from '@app/services/player/player.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    currentTurn: PlayerType = PlayerType.Local;
    onTurn: BehaviorSubject<PlayerType>;
    gameConfig: GameConfig = {
        gameType: '',
        minutes: 0,
        seconds: 0,
        time: 0,
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
        this.playerService.updateReserve(Constants.reserve.SIZE);

        this.nextTurn();
    }

    endGame() {
        // TODO
    }

    nextTurn() {
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
        // TODO Start timer?
    }

    private onVirtualPlayerTurn() {
        this.currentTurn = PlayerType.Virtual;
        this.onTurn.next(this.currentTurn);
        this.virtualPlayerService.onTurn();
    }

    private randomizeTurn(): PlayerType {
        return Math.random() < Constants.HALF ? PlayerType.Local : PlayerType.Virtual;
    }
}
