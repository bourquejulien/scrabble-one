import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { TimeSpan } from './timespan';

const TIME_PERIOD = 1000;

export class Timer {
    time: TimeSpan;

    readonly timerUpdated: BehaviorSubject<TimeSpan>;

    private readonly timerInstance: Observable<number>;
    private isStarted: boolean;
    private timerStopped: Subject<void>;

    constructor() {
        this.time = TimeSpan.fromMilliseconds(0);
        this.isStarted = false;

        this.timerUpdated = new BehaviorSubject<TimeSpan>(this.time);
        this.timerStopped = new Subject();

        this.timerInstance = new Observable<number>();

        this.timerInstance = timer(TIME_PERIOD, TIME_PERIOD).pipe(takeWhile(() => true));

        this.timerInstance.subscribe(() => this.refresh());
    }

    start(time: TimeSpan): void {
        this.time = time;

        this.timerStopped = new Subject();
        this.isStarted = true;
    }

    stop(): void {
        this.time = TimeSpan.fromMilliseconds(0);
        this.isStarted = false;
        this.timerStopped.complete();
    }

    get completed(): Promise<void> {
        return this.timerStopped.toPromise();
    }

    private refresh(): void {
        if (this.isRunning) {
            this.time = this.time.sub(TimeSpan.fromMilliseconds(TIME_PERIOD));
            this.timerUpdated.next(this.time);
        } else {
            this.stop();
        }
    }

    private get isRunning(): boolean {
        return this.isStarted && this.time.totalMilliseconds > 0;
    }
}
