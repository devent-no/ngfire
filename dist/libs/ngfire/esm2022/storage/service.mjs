import { inject, Injectable, Injector } from "@angular/core";
import { ref, uploadBytesResumable } from "firebase/storage";
import { FIRE_STORAGE } from "./tokens";
import * as i0 from "@angular/core";
export class FireStorage {
    constructor() {
        this.injector = inject(Injector);
    }
    get storage() {
        return this.injector.get(FIRE_STORAGE);
    }
    ref(url) {
        return ref(this.storage, url);
    }
    upload(url, bytes, metadata) {
        const ref = this.ref(url);
        return uploadBytesResumable(ref, bytes, metadata);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: FireStorage, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: FireStorage, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.4", ngImport: i0, type: FireStorage, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2xpYnMvbmdmaXJlL3N0b3JhZ2Uvc3JjL3NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzdELE9BQU8sRUFBRSxHQUFHLEVBQUUsb0JBQW9CLEVBQWtCLE1BQU0sa0JBQWtCLENBQUM7QUFDN0UsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLFVBQVUsQ0FBQzs7QUFHeEMsTUFBTSxPQUFPLFdBQVc7SUFEeEI7UUFFVSxhQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBZXJDO0lBWkMsSUFBYyxPQUFPO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELEdBQUcsQ0FBQyxHQUFXO1FBQ2IsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQVcsRUFBRSxLQUFzQyxFQUFFLFFBQXlCO1FBQ25GLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUIsT0FBTyxvQkFBb0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3BELENBQUM7OEdBZlUsV0FBVztrSEFBWCxXQUFXLGNBREUsTUFBTTs7MkZBQ25CLFdBQVc7a0JBRHZCLFVBQVU7bUJBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3RvciB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyByZWYsIHVwbG9hZEJ5dGVzUmVzdW1hYmxlLCBVcGxvYWRNZXRhZGF0YSB9IGZyb20gXCJmaXJlYmFzZS9zdG9yYWdlXCI7XG5pbXBvcnQgeyBGSVJFX1NUT1JBR0UgfSBmcm9tIFwiLi90b2tlbnNcIjtcblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBGaXJlU3RvcmFnZSB7XG4gIHByaXZhdGUgaW5qZWN0b3IgPSBpbmplY3QoSW5qZWN0b3IpO1xuICBwcm90ZWN0ZWQgYnVja2V0Pzogc3RyaW5nO1xuXG4gIHByb3RlY3RlZCBnZXQgc3RvcmFnZSgpIHtcbiAgICByZXR1cm4gdGhpcy5pbmplY3Rvci5nZXQoRklSRV9TVE9SQUdFKTtcbiAgfVxuXG4gIHJlZih1cmw6IHN0cmluZykge1xuICAgIHJldHVybiByZWYodGhpcy5zdG9yYWdlLCB1cmwpO1xuICB9XG5cbiAgdXBsb2FkKHVybDogc3RyaW5nLCBieXRlczogQmxvYiB8IFVpbnQ4QXJyYXkgfCBBcnJheUJ1ZmZlciwgbWV0YWRhdGE/OiBVcGxvYWRNZXRhZGF0YSkge1xuICAgIGNvbnN0IHJlZiA9IHRoaXMucmVmKHVybCk7XG4gICAgcmV0dXJuIHVwbG9hZEJ5dGVzUmVzdW1hYmxlKHJlZiwgYnl0ZXMsIG1ldGFkYXRhKTtcbiAgfVxufSJdfQ==