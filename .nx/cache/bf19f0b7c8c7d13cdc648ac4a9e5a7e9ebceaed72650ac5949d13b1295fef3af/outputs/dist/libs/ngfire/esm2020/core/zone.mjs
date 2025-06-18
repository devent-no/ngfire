import { queueScheduler, asyncScheduler } from "rxjs";
import { observeOn, subscribeOn, tap } from "rxjs/operators";
export class ɵZoneScheduler {
    constructor(zone, delegate = queueScheduler) {
        this.zone = zone;
        this.delegate = delegate;
    }
    now() {
        return this.delegate.now();
    }
    schedule(work, delay, state) {
        const targetZone = this.zone;
        // Wrap the specified work function to make sure that if nested scheduling takes place the
        // work is executed in the correct zone
        const workInZone = function (state) {
            targetZone.runGuarded(() => {
                work.apply(this, [state]);
            });
        };
        // Scheduling itself needs to be run in zone to ensure setInterval calls for async scheduling are done
        // inside the correct zone. This scheduler needs to schedule asynchronously always to ensure that
        // firebase emissions are never synchronous. Specifying a delay causes issues with the queueScheduler delegate.
        return this.delegate.schedule(workInZone, delay, state);
    }
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }
class BlockUntilFirstOperator {
    constructor(zone) {
        this.zone = zone;
        this.task = null;
    }
    call(subscriber, source) {
        const unscheduleTask = this.unscheduleTask.bind(this);
        this.task = this.zone.run(() => Zone.current.scheduleMacroTask('firebaseZoneBlock', noop, {}, noop, noop));
        return source.pipe(tap({ next: unscheduleTask, complete: unscheduleTask, error: unscheduleTask })).subscribe(subscriber).add(unscheduleTask);
    }
    unscheduleTask() {
        // maybe this is a race condition, invoke in a timeout
        // hold for 10ms while I try to figure out what is going on
        setTimeout(() => {
            if (this.task != null && this.task.state === 'scheduled') {
                this.task.invoke();
                this.task = null;
            }
        }, 10);
    }
}
export function keepUnstableUntilFirst(ngZone) {
    return (obs$) => {
        obs$ = obs$.lift(new BlockUntilFirstOperator(ngZone));
        return obs$.pipe(
        // Run the subscribe body outside of Angular (e.g. calling Firebase SDK to add a listener to a change event)
        subscribeOn(ngZone.runOutsideAngular(() => new ɵZoneScheduler(Zone.current))), 
        // Run operators inside the angular zone (e.g. side effects via tap())
        observeOn(ngZone.run(() => new ɵZoneScheduler(Zone.current, asyncScheduler))));
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9uZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2xpYnMvbmdmaXJlL2NvcmUvc3JjL3pvbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFrQyxjQUFjLEVBQWlFLGNBQWMsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNySixPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU3RCxNQUFNLE9BQU8sY0FBYztJQUN6QixZQUFvQixJQUFVLEVBQVUsV0FBMEIsY0FBYztRQUE1RCxTQUFJLEdBQUosSUFBSSxDQUFNO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBZ0M7SUFBRyxDQUFDO0lBRXBGLEdBQUc7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELFFBQVEsQ0FBQyxJQUF1RCxFQUFFLEtBQWMsRUFBRSxLQUFXO1FBQzNGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDN0IsMEZBQTBGO1FBQzFGLHVDQUF1QztRQUN2QyxNQUFNLFVBQVUsR0FBRyxVQUFxQyxLQUFVO1lBQ2hFLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFFRixzR0FBc0c7UUFDdEcsaUdBQWlHO1FBQ2pHLCtHQUErRztRQUMvRyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUQsQ0FBQztDQUNGO0FBR0QsZ0VBQWdFO0FBQ2hFLFNBQVMsSUFBSSxLQUFJLENBQUM7QUFFbEIsTUFBTSx1QkFBdUI7SUFHM0IsWUFBb0IsSUFBWTtRQUFaLFNBQUksR0FBSixJQUFJLENBQVE7UUFGeEIsU0FBSSxHQUFxQixJQUFJLENBQUM7SUFFSCxDQUFDO0lBRXBDLElBQUksQ0FBQyxVQUF5QixFQUFFLE1BQXFCO1FBQ25ELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRTNHLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FDaEIsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUMvRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVPLGNBQWM7UUFDcEIsc0RBQXNEO1FBQ3RELDJEQUEyRDtRQUMzRCxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ2QsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxXQUFXLEVBQUU7Z0JBQ3hELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2FBQ2xCO1FBQ0gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ1QsQ0FBQztDQUNGO0FBR0QsTUFBTSxVQUFVLHNCQUFzQixDQUFDLE1BQWM7SUFDbkQsT0FBTyxDQUFJLElBQW1CLEVBQWlCLEVBQUU7UUFDL0MsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQ2QsSUFBSSx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsQ0FDcEMsQ0FBQztRQUVGLE9BQU8sSUFBSSxDQUFDLElBQUk7UUFDZCw0R0FBNEc7UUFDNUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM3RSxzRUFBc0U7UUFDdEUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQzlFLENBQUM7SUFDSixDQUFDLENBQUE7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdab25lIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IFNjaGVkdWxlckFjdGlvbiwgU2NoZWR1bGVyTGlrZSwgcXVldWVTY2hlZHVsZXIsIFN1YnNjcmlwdGlvbiwgT2JzZXJ2YWJsZSwgU3Vic2NyaWJlciwgVGVhcmRvd25Mb2dpYywgT3BlcmF0b3IsIGFzeW5jU2NoZWR1bGVyIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IG9ic2VydmVPbiwgc3Vic2NyaWJlT24sIHRhcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuXG5leHBvcnQgY2xhc3MgybVab25lU2NoZWR1bGVyIGltcGxlbWVudHMgU2NoZWR1bGVyTGlrZSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgem9uZTogWm9uZSwgcHJpdmF0ZSBkZWxlZ2F0ZTogU2NoZWR1bGVyTGlrZSA9IHF1ZXVlU2NoZWR1bGVyKSB7fVxuXG4gIG5vdygpIHtcbiAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5ub3coKTtcbiAgfVxuXG4gIHNjaGVkdWxlKHdvcms6ICh0aGlzOiBTY2hlZHVsZXJBY3Rpb248YW55Piwgc3RhdGU/OiBhbnkpID0+IHZvaWQsIGRlbGF5PzogbnVtYmVyLCBzdGF0ZT86IGFueSk6IFN1YnNjcmlwdGlvbiB7XG4gICAgY29uc3QgdGFyZ2V0Wm9uZSA9IHRoaXMuem9uZTtcbiAgICAvLyBXcmFwIHRoZSBzcGVjaWZpZWQgd29yayBmdW5jdGlvbiB0byBtYWtlIHN1cmUgdGhhdCBpZiBuZXN0ZWQgc2NoZWR1bGluZyB0YWtlcyBwbGFjZSB0aGVcbiAgICAvLyB3b3JrIGlzIGV4ZWN1dGVkIGluIHRoZSBjb3JyZWN0IHpvbmVcbiAgICBjb25zdCB3b3JrSW5ab25lID0gZnVuY3Rpb24odGhpczogU2NoZWR1bGVyQWN0aW9uPGFueT4sIHN0YXRlOiBhbnkpIHtcbiAgICAgIHRhcmdldFpvbmUucnVuR3VhcmRlZCgoKSA9PiB7XG4gICAgICAgIHdvcmsuYXBwbHkodGhpcywgW3N0YXRlXSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gU2NoZWR1bGluZyBpdHNlbGYgbmVlZHMgdG8gYmUgcnVuIGluIHpvbmUgdG8gZW5zdXJlIHNldEludGVydmFsIGNhbGxzIGZvciBhc3luYyBzY2hlZHVsaW5nIGFyZSBkb25lXG4gICAgLy8gaW5zaWRlIHRoZSBjb3JyZWN0IHpvbmUuIFRoaXMgc2NoZWR1bGVyIG5lZWRzIHRvIHNjaGVkdWxlIGFzeW5jaHJvbm91c2x5IGFsd2F5cyB0byBlbnN1cmUgdGhhdFxuICAgIC8vIGZpcmViYXNlIGVtaXNzaW9ucyBhcmUgbmV2ZXIgc3luY2hyb25vdXMuIFNwZWNpZnlpbmcgYSBkZWxheSBjYXVzZXMgaXNzdWVzIHdpdGggdGhlIHF1ZXVlU2NoZWR1bGVyIGRlbGVnYXRlLlxuICAgIHJldHVybiB0aGlzLmRlbGVnYXRlLnNjaGVkdWxlKHdvcmtJblpvbmUsIGRlbGF5LCBzdGF0ZSk7XG4gIH1cbn1cblxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWVtcHR5LWZ1bmN0aW9uXG5mdW5jdGlvbiBub29wKCkge31cblxuY2xhc3MgQmxvY2tVbnRpbEZpcnN0T3BlcmF0b3I8VD4gaW1wbGVtZW50cyBPcGVyYXRvcjxULCBUPiB7XG4gIHByaXZhdGUgdGFzazogTWFjcm9UYXNrIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB6b25lOiBOZ1pvbmUpIHt9XG5cbiAgY2FsbChzdWJzY3JpYmVyOiBTdWJzY3JpYmVyPFQ+LCBzb3VyY2U6IE9ic2VydmFibGU8VD4pOiBUZWFyZG93bkxvZ2ljIHtcbiAgICBjb25zdCB1bnNjaGVkdWxlVGFzayA9IHRoaXMudW5zY2hlZHVsZVRhc2suYmluZCh0aGlzKTtcbiAgICB0aGlzLnRhc2sgPSB0aGlzLnpvbmUucnVuKCgpID0+IFpvbmUuY3VycmVudC5zY2hlZHVsZU1hY3JvVGFzaygnZmlyZWJhc2Vab25lQmxvY2snLCBub29wLCB7fSwgbm9vcCwgbm9vcCkpO1xuXG4gICAgcmV0dXJuIHNvdXJjZS5waXBlKFxuICAgICAgdGFwKHsgbmV4dDogdW5zY2hlZHVsZVRhc2ssIGNvbXBsZXRlOiB1bnNjaGVkdWxlVGFzaywgZXJyb3I6IHVuc2NoZWR1bGVUYXNrIH0pXG4gICAgKS5zdWJzY3JpYmUoc3Vic2NyaWJlcikuYWRkKHVuc2NoZWR1bGVUYXNrKTtcbiAgfVxuXG4gIHByaXZhdGUgdW5zY2hlZHVsZVRhc2soKSB7XG4gICAgLy8gbWF5YmUgdGhpcyBpcyBhIHJhY2UgY29uZGl0aW9uLCBpbnZva2UgaW4gYSB0aW1lb3V0XG4gICAgLy8gaG9sZCBmb3IgMTBtcyB3aGlsZSBJIHRyeSB0byBmaWd1cmUgb3V0IHdoYXQgaXMgZ29pbmcgb25cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnRhc2sgIT0gbnVsbCAmJiB0aGlzLnRhc2suc3RhdGUgPT09ICdzY2hlZHVsZWQnKSB7XG4gICAgICAgIHRoaXMudGFzay5pbnZva2UoKTtcbiAgICAgICAgdGhpcy50YXNrID0gbnVsbDtcbiAgICAgIH1cbiAgICB9LCAxMCk7XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24ga2VlcFVuc3RhYmxlVW50aWxGaXJzdChuZ1pvbmU6IE5nWm9uZSkge1xuICByZXR1cm4gPFQ+KG9icyQ6IE9ic2VydmFibGU8VD4pOiBPYnNlcnZhYmxlPFQ+ID0+IHtcbiAgICBvYnMkID0gb2JzJC5saWZ0KFxuICAgICAgbmV3IEJsb2NrVW50aWxGaXJzdE9wZXJhdG9yKG5nWm9uZSlcbiAgICApO1xuXG4gICAgcmV0dXJuIG9icyQucGlwZShcbiAgICAgIC8vIFJ1biB0aGUgc3Vic2NyaWJlIGJvZHkgb3V0c2lkZSBvZiBBbmd1bGFyIChlLmcuIGNhbGxpbmcgRmlyZWJhc2UgU0RLIHRvIGFkZCBhIGxpc3RlbmVyIHRvIGEgY2hhbmdlIGV2ZW50KVxuICAgICAgc3Vic2NyaWJlT24obmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IG5ldyDJtVpvbmVTY2hlZHVsZXIoWm9uZS5jdXJyZW50KSkpLFxuICAgICAgLy8gUnVuIG9wZXJhdG9ycyBpbnNpZGUgdGhlIGFuZ3VsYXIgem9uZSAoZS5nLiBzaWRlIGVmZmVjdHMgdmlhIHRhcCgpKVxuICAgICAgb2JzZXJ2ZU9uKG5nWm9uZS5ydW4oKCkgPT4gbmV3IMm1Wm9uZVNjaGVkdWxlcihab25lLmN1cnJlbnQsIGFzeW5jU2NoZWR1bGVyKSkpLFxuICAgICk7XG4gIH1cbn0iXX0=