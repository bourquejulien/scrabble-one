/* eslint-disable @typescript-eslint/naming-convention -- Constants file*/
/* eslint-disable @typescript-eslint/no-magic-numbers -- Constants file*/
import { Grid } from './grid.constants';

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
    static readonly MAX_SKIP_TURN = 3;
    static readonly RACK_SIZE = 7;
    static readonly CHAR_OFFSET = 97; // 'a' has ASCII value of 97
    static readonly NB_ALTERNATIVES = 3;
    static readonly PLAYER_ONE_COLOR = '#45cb85';
    static readonly PLAYER_TWO_COLOR = '#f44336';
    static readonly SYSTEM_COLOR = '#3f51b5';
    static readonly BLACK_FONT = '#000000';
    static readonly WHITE_FONT = '#FFFFFF';
}
