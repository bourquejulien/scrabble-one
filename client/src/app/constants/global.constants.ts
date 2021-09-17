/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Grid } from './grid.constants';

export class Constants {
    static readonly grid = new Grid();
    static readonly gameTypesList = ['Mode Solo Débutant'];
    static readonly turnLengthList = ['Une Minute', 'Deux Minutes'];
    static readonly botNames = ['Maurice', 'Claudette', 'Alphonse'];
    static readonly maxSizeName = 16;
    static readonly minSizeName = 3;
}
