const SECONDS_IN_MINUTE = 60;
const MILLISECONDS_IN_SECOND = 1000;

export class TimeSpan {
    private readonly milliseconds: number;

    private constructor(milliseconds: number) {
        this.milliseconds = milliseconds;
    }

    static fromMilliseconds(milliseconds: number): TimeSpan {
        return new TimeSpan(milliseconds);
    }

    static fromSeconds(seconds: number): TimeSpan {
        return new TimeSpan(seconds * MILLISECONDS_IN_SECOND);
    }

    static fromMinutesSeconds(minutes: number, seconds: number): TimeSpan {
        return new TimeSpan((minutes * SECONDS_IN_MINUTE + seconds) * MILLISECONDS_IN_SECOND);
    }

    get totalMilliseconds(): number {
        return this.milliseconds;
    }

    get totalMinutes(): number {
        return Math.floor(this.milliseconds / (MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE));
    }

    get seconds(): number {
        return Math.floor((this.milliseconds / MILLISECONDS_IN_SECOND) % SECONDS_IN_MINUTE);
    }

    add(otherTimeSpan: TimeSpan): TimeSpan {
        return new TimeSpan(this.milliseconds + otherTimeSpan.milliseconds);
    }

    sub(otherTimeSpan: TimeSpan): TimeSpan {
        return new TimeSpan(this.milliseconds - otherTimeSpan.milliseconds);
    }
}
