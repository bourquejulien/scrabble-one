import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { repeatWhen, takeWhile } from 'rxjs/operators';
import { TimeSpan } from './timespan';

const TIME_PERIOD = 1000;

export class Timer {
    time: TimeSpan;

    readonly countdownStarted: Subject<void>;
    readonly timerUpdated: BehaviorSubject<TimeSpan>;

    private readonly timerInstance: Observable<number>;
    private readonly timeLimit: TimeSpan;
    private isStarted: boolean;
    private timerStopped: Subject<void>;

    constructor(timeLimit: TimeSpan) {
        this.timeLimit = timeLimit;
        this.time = timeLimit;
        this.isStarted = false;

        this.timerUpdated = new BehaviorSubject<TimeSpan>(this.time);
        this.countdownStarted = new Subject<void>();
        this.timerStopped = new Subject();

        this.timerInstance = new Observable<number>();

        this.timerInstance = timer(TIME_PERIOD, TIME_PERIOD).pipe(
            takeWhile(() => this.isRunning),
            repeatWhen(() => this.countdownStarted),
        );

        this.timerInstance.subscribe(() => this.refresh());
    }

    start(): void {
        this.time = this.timeLimit;
        this.isStarted = true;
        this.countdownStarted.next();
    }

    stop(): void {
        this.time = this.timeLimit;
        this.isStarted = false;
        this.timerStopped.complete();
        this.timerStopped = new Subject();
    }

    get completed(): Promise<void> {
        return this.timerStopped.toPromise();
    }

    private refresh(): void {
        this.time = this.time.sub(TimeSpan.fromMilliseconds(TIME_PERIOD));

        this.timerUpdated.next(this.time);

        if (!this.isRunning) {
            this.stop();
        }
    }

    private get isRunning(): boolean {
        return this.isStarted && this.time.totalMilliseconds > 0;
    }
}
