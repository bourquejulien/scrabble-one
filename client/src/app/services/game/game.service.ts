import { Injectable } from '@angular/core';
import { GameConfig } from '@app/classes/game-config';
import { PlayerType } from '@app/classes/player-type';
import { Constants } from '@app/constants/global.constants';
import { PlayerService } from '@app/services/player/player.service';
import { VirtualPlayerService } from '@app/services/virtual-player.service';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    currentTurn: PlayerType = PlayerType.Local;
    gameConfig: GameConfig;

    constructor(playerService: PlayerService, private readonly virtualPlayerService: VirtualPlayerService) {
        playerService.turnComplete.subscribe((e) => this.handleTurnCompletion(e));
        virtualPlayerService.turnComplete.subscribe((e) => this.handleTurnCompletion(e));
    }

    startGame(gameConfig: GameConfig) {
        this.gameConfig = gameConfig;
        this.currentTurn = this.randomizeTurn();
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
        // TODO Start timer?
    }

    private onVirtualPlayerTurn() {
        this.currentTurn = PlayerType.Virtual;
        this.virtualPlayerService.onTurn();
    }

    private randomizeTurn(): PlayerType {
        return Math.random() < Constants.HALF ? PlayerType.Local : PlayerType.Virtual;
    }
}
