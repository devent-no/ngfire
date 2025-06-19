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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9uZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2xpYnMvbmdmaXJlL2NvcmUvc3JjL3pvbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFrQyxjQUFjLEVBQWlFLGNBQWMsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNySixPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU3RCxNQUFNLE9BQU8sY0FBYztJQUN6QixZQUFvQixJQUFVLEVBQVUsV0FBMEIsY0FBYztRQUE1RCxTQUFJLEdBQUosSUFBSSxDQUFNO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBZ0M7SUFBRyxDQUFDO0lBRXBGLEdBQUc7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELFFBQVEsQ0FBQyxJQUF1RCxFQUFFLEtBQWMsRUFBRSxLQUFXO1FBQzNGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDN0IsMEZBQTBGO1FBQzFGLHVDQUF1QztRQUN2QyxNQUFNLFVBQVUsR0FBRyxVQUFxQyxLQUFVO1lBQ2hFLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFFRixzR0FBc0c7UUFDdEcsaUdBQWlHO1FBQ2pHLCtHQUErRztRQUMvRyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDMUQsQ0FBQztDQUNGO0FBR0QsZ0VBQWdFO0FBQ2hFLFNBQVMsSUFBSSxLQUFJLENBQUM7QUFFbEIsTUFBTSx1QkFBdUI7SUFHM0IsWUFBb0IsSUFBWTtRQUFaLFNBQUksR0FBSixJQUFJLENBQVE7UUFGeEIsU0FBSSxHQUFxQixJQUFJLENBQUM7SUFFSCxDQUFDO0lBRXBDLElBQUksQ0FBQyxVQUF5QixFQUFFLE1BQXFCO1FBQ25ELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRTNHLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FDaEIsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUMvRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVPLGNBQWM7UUFDcEIsc0RBQXNEO1FBQ3RELDJEQUEyRDtRQUMzRCxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ2QsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxXQUFXLEVBQUUsQ0FBQztnQkFDekQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDbkIsQ0FBQztRQUNILENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNULENBQUM7Q0FDRjtBQUdELE1BQU0sVUFBVSxzQkFBc0IsQ0FBQyxNQUFjO0lBQ25ELE9BQU8sQ0FBSSxJQUFtQixFQUFpQixFQUFFO1FBQy9DLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUNkLElBQUksdUJBQXVCLENBQUMsTUFBTSxDQUFDLENBQ3BDLENBQUM7UUFFRixPQUFPLElBQUksQ0FBQyxJQUFJO1FBQ2QsNEdBQTRHO1FBQzVHLFdBQVcsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDN0Usc0VBQXNFO1FBQ3RFLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUM5RSxDQUFDO0lBQ0osQ0FBQyxDQUFBO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nWm9uZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBTY2hlZHVsZXJBY3Rpb24sIFNjaGVkdWxlckxpa2UsIHF1ZXVlU2NoZWR1bGVyLCBTdWJzY3JpcHRpb24sIE9ic2VydmFibGUsIFN1YnNjcmliZXIsIFRlYXJkb3duTG9naWMsIE9wZXJhdG9yLCBhc3luY1NjaGVkdWxlciB9IGZyb20gXCJyeGpzXCI7XG5pbXBvcnQgeyBvYnNlcnZlT24sIHN1YnNjcmliZU9uLCB0YXAgfSBmcm9tIFwicnhqcy9vcGVyYXRvcnNcIjtcblxuZXhwb3J0IGNsYXNzIMm1Wm9uZVNjaGVkdWxlciBpbXBsZW1lbnRzIFNjaGVkdWxlckxpa2Uge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHpvbmU6IFpvbmUsIHByaXZhdGUgZGVsZWdhdGU6IFNjaGVkdWxlckxpa2UgPSBxdWV1ZVNjaGVkdWxlcikge31cblxuICBub3coKSB7XG4gICAgcmV0dXJuIHRoaXMuZGVsZWdhdGUubm93KCk7XG4gIH1cblxuICBzY2hlZHVsZSh3b3JrOiAodGhpczogU2NoZWR1bGVyQWN0aW9uPGFueT4sIHN0YXRlPzogYW55KSA9PiB2b2lkLCBkZWxheT86IG51bWJlciwgc3RhdGU/OiBhbnkpOiBTdWJzY3JpcHRpb24ge1xuICAgIGNvbnN0IHRhcmdldFpvbmUgPSB0aGlzLnpvbmU7XG4gICAgLy8gV3JhcCB0aGUgc3BlY2lmaWVkIHdvcmsgZnVuY3Rpb24gdG8gbWFrZSBzdXJlIHRoYXQgaWYgbmVzdGVkIHNjaGVkdWxpbmcgdGFrZXMgcGxhY2UgdGhlXG4gICAgLy8gd29yayBpcyBleGVjdXRlZCBpbiB0aGUgY29ycmVjdCB6b25lXG4gICAgY29uc3Qgd29ya0luWm9uZSA9IGZ1bmN0aW9uKHRoaXM6IFNjaGVkdWxlckFjdGlvbjxhbnk+LCBzdGF0ZTogYW55KSB7XG4gICAgICB0YXJnZXRab25lLnJ1bkd1YXJkZWQoKCkgPT4ge1xuICAgICAgICB3b3JrLmFwcGx5KHRoaXMsIFtzdGF0ZV0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIFNjaGVkdWxpbmcgaXRzZWxmIG5lZWRzIHRvIGJlIHJ1biBpbiB6b25lIHRvIGVuc3VyZSBzZXRJbnRlcnZhbCBjYWxscyBmb3IgYXN5bmMgc2NoZWR1bGluZyBhcmUgZG9uZVxuICAgIC8vIGluc2lkZSB0aGUgY29ycmVjdCB6b25lLiBUaGlzIHNjaGVkdWxlciBuZWVkcyB0byBzY2hlZHVsZSBhc3luY2hyb25vdXNseSBhbHdheXMgdG8gZW5zdXJlIHRoYXRcbiAgICAvLyBmaXJlYmFzZSBlbWlzc2lvbnMgYXJlIG5ldmVyIHN5bmNocm9ub3VzLiBTcGVjaWZ5aW5nIGEgZGVsYXkgY2F1c2VzIGlzc3VlcyB3aXRoIHRoZSBxdWV1ZVNjaGVkdWxlciBkZWxlZ2F0ZS5cbiAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5zY2hlZHVsZSh3b3JrSW5ab25lLCBkZWxheSwgc3RhdGUpO1xuICB9XG59XG5cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1lbXB0eS1mdW5jdGlvblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmNsYXNzIEJsb2NrVW50aWxGaXJzdE9wZXJhdG9yPFQ+IGltcGxlbWVudHMgT3BlcmF0b3I8VCwgVD4ge1xuICBwcml2YXRlIHRhc2s6IE1hY3JvVGFzayB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgem9uZTogTmdab25lKSB7fVxuXG4gIGNhbGwoc3Vic2NyaWJlcjogU3Vic2NyaWJlcjxUPiwgc291cmNlOiBPYnNlcnZhYmxlPFQ+KTogVGVhcmRvd25Mb2dpYyB7XG4gICAgY29uc3QgdW5zY2hlZHVsZVRhc2sgPSB0aGlzLnVuc2NoZWR1bGVUYXNrLmJpbmQodGhpcyk7XG4gICAgdGhpcy50YXNrID0gdGhpcy56b25lLnJ1bigoKSA9PiBab25lLmN1cnJlbnQuc2NoZWR1bGVNYWNyb1Rhc2soJ2ZpcmViYXNlWm9uZUJsb2NrJywgbm9vcCwge30sIG5vb3AsIG5vb3ApKTtcblxuICAgIHJldHVybiBzb3VyY2UucGlwZShcbiAgICAgIHRhcCh7IG5leHQ6IHVuc2NoZWR1bGVUYXNrLCBjb21wbGV0ZTogdW5zY2hlZHVsZVRhc2ssIGVycm9yOiB1bnNjaGVkdWxlVGFzayB9KVxuICAgICkuc3Vic2NyaWJlKHN1YnNjcmliZXIpLmFkZCh1bnNjaGVkdWxlVGFzayk7XG4gIH1cblxuICBwcml2YXRlIHVuc2NoZWR1bGVUYXNrKCkge1xuICAgIC8vIG1heWJlIHRoaXMgaXMgYSByYWNlIGNvbmRpdGlvbiwgaW52b2tlIGluIGEgdGltZW91dFxuICAgIC8vIGhvbGQgZm9yIDEwbXMgd2hpbGUgSSB0cnkgdG8gZmlndXJlIG91dCB3aGF0IGlzIGdvaW5nIG9uXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy50YXNrICE9IG51bGwgJiYgdGhpcy50YXNrLnN0YXRlID09PSAnc2NoZWR1bGVkJykge1xuICAgICAgICB0aGlzLnRhc2suaW52b2tlKCk7XG4gICAgICAgIHRoaXMudGFzayA9IG51bGw7XG4gICAgICB9XG4gICAgfSwgMTApO1xuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGtlZXBVbnN0YWJsZVVudGlsRmlyc3Qobmdab25lOiBOZ1pvbmUpIHtcbiAgcmV0dXJuIDxUPihvYnMkOiBPYnNlcnZhYmxlPFQ+KTogT2JzZXJ2YWJsZTxUPiA9PiB7XG4gICAgb2JzJCA9IG9icyQubGlmdChcbiAgICAgIG5ldyBCbG9ja1VudGlsRmlyc3RPcGVyYXRvcihuZ1pvbmUpXG4gICAgKTtcblxuICAgIHJldHVybiBvYnMkLnBpcGUoXG4gICAgICAvLyBSdW4gdGhlIHN1YnNjcmliZSBib2R5IG91dHNpZGUgb2YgQW5ndWxhciAoZS5nLiBjYWxsaW5nIEZpcmViYXNlIFNESyB0byBhZGQgYSBsaXN0ZW5lciB0byBhIGNoYW5nZSBldmVudClcbiAgICAgIHN1YnNjcmliZU9uKG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiBuZXcgybVab25lU2NoZWR1bGVyKFpvbmUuY3VycmVudCkpKSxcbiAgICAgIC8vIFJ1biBvcGVyYXRvcnMgaW5zaWRlIHRoZSBhbmd1bGFyIHpvbmUgKGUuZy4gc2lkZSBlZmZlY3RzIHZpYSB0YXAoKSlcbiAgICAgIG9ic2VydmVPbihuZ1pvbmUucnVuKCgpID0+IG5ldyDJtVpvbmVTY2hlZHVsZXIoWm9uZS5jdXJyZW50LCBhc3luY1NjaGVkdWxlcikpKSxcbiAgICApO1xuICB9XG59Il19