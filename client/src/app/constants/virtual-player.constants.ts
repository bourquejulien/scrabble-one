/* eslint-disable @typescript-eslint/no-magic-numbers -- Constants file */
/* eslint-disable @typescript-eslint/naming-convention -- Constants file */
export class VirtualPlayer {
    readonly SKIP_PERCENTAGE = 0.1;
    readonly EXCHANGE_PERCENTAGE = 0.1;
    readonly PLAY_PERCENTAGE = 0.8;
    readonly SCORE_RANGE = [
        { percentage: 0.4, range: { min: 0, max: 6 } },
        { percentage: 0.3, range: { min: 7, max: 12 } },
        { percentage: 0.3, range: { min: 13, max: 18 } },
    ];
}
