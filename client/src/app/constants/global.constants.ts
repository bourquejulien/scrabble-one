/* eslint-disable @typescript-eslint/naming-convention -- Constants file*/
/* eslint-disable @typescript-eslint/no-magic-numbers -- Constants file*/
import { Grid } from './grid.constants';

export class Constants {
    static readonly GRID = new Grid();
    static readonly BOT_NAMES = ['Maurice', 'Claudette', 'Alphonse'];
    static readonly VIRTUAL_PLAYERS_LEVELS_NAMES = ['Joueur virtuel débutant', 'Joueur virtuel expert'];
    static readonly CHAR_OFFSET = 97; // 'a' has ASCII value of 97
    static readonly PLAYER_ONE_COLOR = '#45cb85';
    static readonly PLAYER_TWO_COLOR = '#f44336';
    static readonly SYSTEM_COLOR = '#3f51b5';
    static readonly BLACK_FONT = '#000000';
    static readonly WHITE_FONT = '#FFFFFF';
}
