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
}
CallableFunctions.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: CallableFunctions, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
CallableFunctions.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: CallableFunctions, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: CallableFunctions, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbGlicy9uZ2ZpcmUvZnVuY3Rpb25zL3NyYy9mdW5jdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzdELE9BQU8sRUFBRSxhQUFhLEVBQXVDLE1BQU0sb0JBQW9CLENBQUM7QUFDeEYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFVBQVUsQ0FBQzs7QUFJM0MsTUFBTSxPQUFPLGlCQUFpQjtJQUQ5QjtRQUVVLGFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUIsY0FBUyxHQUFrQyxFQUFFLENBQUM7S0F5QnZEO0lBdkJDLElBQWMsUUFBUTtRQUNwQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxPQUFPLENBQU8sSUFBWTtRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN6QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzNEO1FBQ0QsT0FBTyxDQUFDLElBQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJLENBQ1IsSUFBWSxFQUNaLElBQU8sRUFDUCxPQUE4QjtRQUU5QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN6QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztTQUNwRTtRQUNELG9FQUFvRTtRQUNwRSxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakQsT0FBTyxNQUFNLENBQUMsSUFBVyxDQUFDO0lBQzVCLENBQUM7OytHQTFCVSxpQkFBaUI7bUhBQWpCLGlCQUFpQixjQURKLE1BQU07NEZBQ25CLGlCQUFpQjtrQkFEN0IsVUFBVTttQkFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpbmplY3QsIEluamVjdGFibGUsIEluamVjdG9yIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IGh0dHBzQ2FsbGFibGUsIEh0dHBzQ2FsbGFibGUsIEh0dHBzQ2FsbGFibGVPcHRpb25zIH0gZnJvbSBcImZpcmViYXNlL2Z1bmN0aW9uc1wiO1xuaW1wb3J0IHsgQ0xPVURfRlVOQ1RJT05TIH0gZnJvbSBcIi4vdG9rZW5zXCI7XG5cblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBDYWxsYWJsZUZ1bmN0aW9ucyB7XG4gIHByaXZhdGUgaW5qZWN0b3IgPSBpbmplY3QoSW5qZWN0b3IpO1xuICBwcml2YXRlIGNhbGxhYmxlczogUmVjb3JkPHN0cmluZywgSHR0cHNDYWxsYWJsZT4gPSB7fTtcblxuICBwcm90ZWN0ZWQgZ2V0IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmluamVjdG9yLmdldChDTE9VRF9GVU5DVElPTlMpO1xuICB9XG5cbiAgcHJlcGFyZTxJLCBPPihuYW1lOiBzdHJpbmcpOiAoZGF0YTogSSkgPT4gUHJvbWlzZTxPPiB7XG4gICAgaWYgKCF0aGlzLmNhbGxhYmxlc1tuYW1lXSkge1xuICAgICAgdGhpcy5jYWxsYWJsZXNbbmFtZV0gPSBodHRwc0NhbGxhYmxlKHRoaXMuZnVuY3Rpb24sIG5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gKGRhdGE6IEkpID0+IHRoaXMuY2FsbChuYW1lLCBkYXRhKTtcbiAgfVxuXG4gIGFzeW5jIGNhbGw8SSwgTz4oXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGRhdGE6IEksXG4gICAgb3B0aW9ucz86IEh0dHBzQ2FsbGFibGVPcHRpb25zIFxuICApOiBQcm9taXNlPE8+IHtcbiAgICBpZiAoIXRoaXMuY2FsbGFibGVzW25hbWVdKSB7XG4gICAgICB0aGlzLmNhbGxhYmxlc1tuYW1lXSA9IGh0dHBzQ2FsbGFibGUodGhpcy5mdW5jdGlvbiwgbmFtZSwgb3B0aW9ucyk7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5jYWxsYWJsZXNbbmFtZV0hKGRhdGEpO1xuICAgIHJldHVybiByZXN1bHQuZGF0YSBhcyBhbnk7XG4gIH1cbn0iXX0=