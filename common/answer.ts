export interface Success<T> {
    isSuccess: true;
    payload: T;
}

export interface Failure<T> {
    isSuccess: false;
    payload: T;
}

export type Answer<S, F = S> = Success<S> | Failure<F>;
