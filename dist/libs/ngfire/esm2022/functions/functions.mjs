import { inject, Injectable, Injector } from "@angular/core";
import { httpsCallable } from "firebase/functions";
import { CLOUD_FUNCTIONS } from "./tokens";
import * as i0 from "@angular/core";
export class CallableFunctions {
    constructor() {
        this.injector = inject(Injector);
        this.callables = {};
    }
    get function() {
        return this.injector.get(CLOUD_FUNCTIONS);
    }
    prepare(name) {
        if (!this.callables[name]) {
            this.callables[name] = httpsCallable(this.function, name);
        }
        return (data) => this.call(name, data);
    }
    async call(name, data, options) {
        if (!this.callables[name]) {
            this.callables[name] = httpsCallable(this.function, name, options);
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const result = await this.callables[name](data);
        return result.data;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: CallableFunctions, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: CallableFunctions, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: CallableFunctions, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbGlicy9uZ2ZpcmUvZnVuY3Rpb25zL3NyYy9mdW5jdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzdELE9BQU8sRUFBRSxhQUFhLEVBQXVDLE1BQU0sb0JBQW9CLENBQUM7QUFDeEYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFVBQVUsQ0FBQzs7QUFJM0MsTUFBTSxPQUFPLGlCQUFpQjtJQUQ5QjtRQUVVLGFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUIsY0FBUyxHQUFrQyxFQUFFLENBQUM7S0F5QnZEO0lBdkJDLElBQWMsUUFBUTtRQUNwQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxPQUFPLENBQU8sSUFBWTtRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUNELE9BQU8sQ0FBQyxJQUFPLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUNSLElBQVksRUFDWixJQUFPLEVBQ1AsT0FBOEI7UUFFOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBQ0Qsb0VBQW9FO1FBQ3BFLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCxPQUFPLE1BQU0sQ0FBQyxJQUFXLENBQUM7SUFDNUIsQ0FBQzs4R0ExQlUsaUJBQWlCO2tIQUFqQixpQkFBaUIsY0FESixNQUFNOzsyRkFDbkIsaUJBQWlCO2tCQUQ3QixVQUFVO21CQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGluamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0b3IgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgaHR0cHNDYWxsYWJsZSwgSHR0cHNDYWxsYWJsZSwgSHR0cHNDYWxsYWJsZU9wdGlvbnMgfSBmcm9tIFwiZmlyZWJhc2UvZnVuY3Rpb25zXCI7XG5pbXBvcnQgeyBDTE9VRF9GVU5DVElPTlMgfSBmcm9tIFwiLi90b2tlbnNcIjtcblxuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIENhbGxhYmxlRnVuY3Rpb25zIHtcbiAgcHJpdmF0ZSBpbmplY3RvciA9IGluamVjdChJbmplY3Rvcik7XG4gIHByaXZhdGUgY2FsbGFibGVzOiBSZWNvcmQ8c3RyaW5nLCBIdHRwc0NhbGxhYmxlPiA9IHt9O1xuXG4gIHByb3RlY3RlZCBnZXQgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5qZWN0b3IuZ2V0KENMT1VEX0ZVTkNUSU9OUyk7XG4gIH1cblxuICBwcmVwYXJlPEksIE8+KG5hbWU6IHN0cmluZyk6IChkYXRhOiBJKSA9PiBQcm9taXNlPE8+IHtcbiAgICBpZiAoIXRoaXMuY2FsbGFibGVzW25hbWVdKSB7XG4gICAgICB0aGlzLmNhbGxhYmxlc1tuYW1lXSA9IGh0dHBzQ2FsbGFibGUodGhpcy5mdW5jdGlvbiwgbmFtZSk7XG4gICAgfVxuICAgIHJldHVybiAoZGF0YTogSSkgPT4gdGhpcy5jYWxsKG5hbWUsIGRhdGEpO1xuICB9XG5cbiAgYXN5bmMgY2FsbDxJLCBPPihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgZGF0YTogSSxcbiAgICBvcHRpb25zPzogSHR0cHNDYWxsYWJsZU9wdGlvbnMgXG4gICk6IFByb21pc2U8Tz4ge1xuICAgIGlmICghdGhpcy5jYWxsYWJsZXNbbmFtZV0pIHtcbiAgICAgIHRoaXMuY2FsbGFibGVzW25hbWVdID0gaHR0cHNDYWxsYWJsZSh0aGlzLmZ1bmN0aW9uLCBuYW1lLCBvcHRpb25zKTtcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmNhbGxhYmxlc1tuYW1lXSEoZGF0YSk7XG4gICAgcmV0dXJuIHJlc3VsdC5kYXRhIGFzIGFueTtcbiAgfVxufSJdfQ==