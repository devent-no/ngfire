import type { FirebaseApp } from "firebase/app";
import { Dependencies } from "firebase/auth";
export declare const authEmulator: (url: string, options?: {
    disableWarnings: boolean;
} | undefined) => (app: FirebaseApp, deps?: Dependencies) => import("@firebase/auth").Auth;
