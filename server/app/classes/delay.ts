export class Timer {
    static async delay(timeMs: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, timeMs);
        });
    }
}
