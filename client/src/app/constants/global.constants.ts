/* eslint-disable @typescript-eslint/naming-convention -- Constants file*/
/* eslint-disable @typescript-eslint/no-magic-numbers -- Constants file*/
import { Dictionary } from './dictionary.constants';
import { Grid } from './grid.constants';
import { Reserve } from './reserve.constants';
import { VirtualPlayer } from './virtual-player.constants';

export class Constants {
    static readonly grid = new Grid();
    static readonly dictionary = new Dictionary();
    static readonly reserve = new Reserve();
    static readonly virtualPlayer = new VirtualPlayer();
}
