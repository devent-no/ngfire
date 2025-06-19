import { NgZone } from "@angular/core";
import { SchedulerAction, SchedulerLike, Subscription, Observable } from "rxjs";
export declare class ɵZoneScheduler implements SchedulerLike {
    private zone;
    private delegate;
    constructor(zone: Zone, delegate?: SchedulerLike);
    now(): number;
    schedule(work: (this: SchedulerAction<any>, state?: any) => void, delay?: number, state?: any): Subscription;
}
export declare function keepUnstableUntilFirst(ngZone: NgZone): <T>(obs$: Observable<T>) => Observable<T>;
