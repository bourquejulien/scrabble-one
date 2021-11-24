import { Timer } from '@app/classes/delay';
import { PlayerInfo } from '@app/classes/player-info';
import { Player } from '@app/classes/player/player';
import * as logger from 'winston';
import { Action } from './actions/action';

const MIN_PLAYTIME_MILLISECONDS = 3000;

export abstract class VirtualPlayer extends Player {
    protected constructor(private readonly runAction: (action: Action) => Action | null, playerInfo: PlayerInfo) {
        super(playerInfo);
    }

    async startTurn(): Promise<void> {
        logger.debug(`VirtualPlayer - StartTurn - Id: ${this.playerInfo.id}`);

        this.isTurn = true;
        this.socketHandler.sendData('onTurn', this.id);

        try {
            await Timer.delay(MIN_PLAYTIME_MILLISECONDS);

            let action = this.runAction(this.nextAction());
            while (action) {
                action = this.runAction(action);
            }
        } catch (e) {
            logger.error('VirtualPlayer abnormally stopped', e);
        }

        logger.debug(`VirtualPlayer: ${this.id} - EndTurn`);

        this.fillRack();
        this.endTurn();
    }

    protected abstract nextAction(): Action;
}
