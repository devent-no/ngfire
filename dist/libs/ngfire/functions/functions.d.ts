import { HttpsCallableOptions } from "firebase/functions";
import * as i0 from "@angular/core";
export declare class CallableFunctions {
    private injector;
    private callables;
    protected get function(): import("@firebase/functions").Functions;
    prepare<I, O>(name: string): (data: I) => Promise<O>;
    call<I, O>(name: string, data: I, options?: HttpsCallableOptions): Promise<O>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CallableFunctions, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CallableFunctions>;
}
