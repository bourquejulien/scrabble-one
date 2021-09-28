/* eslint-disable @typescript-eslint/naming-convention -- Constants file*/
/* eslint-disable @typescript-eslint/no-magic-numbers -- Constants file*/
import { Dictionary } from './dictionary.constants';
import { Grid } from './grid.constants';
// import { ReserveService } from '@app/services/reserve/reserve.service';
import { VirtualPlayer } from './virtual-player.constants';

export class Constants {
    static readonly GRID = new Grid();
    static readonly GAME_TYPES_LIST = ['Mode Solo Débutant'];
    static readonly TURN_LENGTH_LIST = ['Une Minute', 'Deux Minutes'];
    static readonly BOT_NAMES = ['Maurice', 'Claudette', 'Alphonse'];
    static readonly TURN_LENGTH_MINUTES = [0, 1, 2, 3, 4, 5];
    static readonly TURN_LENGTH_SECONDS = [0, 15, 30, 45];
    static readonly MAX_SIZE_NAME = 16;
    static readonly MIN_SIZE_NAME = 3;
    static readonly HALF = 0.5;
    static readonly TIME_CONSTANT: number = 60;
    static readonly dictionary = new Dictionary();
    // static readonly reserve = new Reserve();
    static readonly virtualPlayer = new VirtualPlayer();
    static readonly MIN_SIZE = 7;
}
