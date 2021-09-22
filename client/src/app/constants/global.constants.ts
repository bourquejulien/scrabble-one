/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Dictionary } from './dictionary.constants';
import { Grid } from './grid.constants';
import { Reserve } from './reserve.constants';
import { VirtualPlayer } from './virtual-player.constants';

export class Constants {
    static readonly grid = new Grid();
    static readonly gameTypesList = ['Mode Solo Débutant'];
    static readonly turnLengthList = ['Une Minute', 'Deux Minutes'];
    static readonly botNames = ['Maurice', 'Claudette', 'Alphonse'];
    static readonly turnLengthMinutes = [0, 1, 2, 3, 4, 5];
    static readonly turnLengthSeconds = [0, 15, 30, 45];
    static readonly maxSizeName = 16;
    static readonly minSizeName = 3;
    static readonly half = 0.5;
    static readonly timeConstant: number = 60;
    static readonly dictionary = new Dictionary();
    static readonly reserve = new Reserve();
    static readonly virtualPlayer = new VirtualPlayer();
}
