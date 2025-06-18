import { __awaiter } from 'tslib';
import * as i0 from '@angular/core';
import { InjectionToken, inject, InjectFlags, Injector, Injectable } from '@angular/core';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { FIREBASE_APP } from 'ngfire/app';
import { getConfig, REGION_OR_DOMAIN } from 'ngfire/tokens';

const CLOUD_FUNCTIONS = new InjectionToken('Firebase cloud functions', {
    providedIn: 'root',
    factory: () => {
        const config = getConfig();
        const regionOrDomain = inject(REGION_OR_DOMAIN, InjectFlags.Optional);
        const app = inject(FIREBASE_APP);
        if (config.functions) {
            return config.functions(app, regionOrDomain !== null && regionOrDomain !== void 0 ? regionOrDomain : undefined);
        }
        else {
            return getFunctions(app, regionOrDomain !== null && regionOrDomain !== void 0 ? regionOrDomain : undefined);
        }
    },
});

class CallableFunctions {
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
    call(name, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.callables[name]) {
                this.callables[name] = httpsCallable(this.function, name, options);
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const result = yield this.callables[name](data);
            return result.data;
        });
    }
}
CallableFunctions.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: CallableFunctions, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
CallableFunctions.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: CallableFunctions, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: CallableFunctions, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { CLOUD_FUNCTIONS, CallableFunctions };
//# sourceMappingURL=ngfire-functions.mjs.map
