import { InjectionToken } from "@angular/core";
import type { Functions, getFunctions } from "firebase/functions";
import type { FirebaseStorage, getStorage } from "firebase/storage";
import type { FirebaseApp, FirebaseAppSettings, FirebaseOptions, initializeApp } from 'firebase/app';
import type { Auth, Dependencies, initializeAuth } from "firebase/auth";
import type { Firestore, FirestoreSettings, initializeFirestore } from 'firebase/firestore';
import type { Database, getDatabase } from "firebase/database";
import type { Analytics, AnalyticsSettings, initializeAnalytics } from "firebase/analytics";
export interface FirebaseConfig {
    options: FirebaseOptions;
    app?: (...params: Parameters<typeof initializeApp>) => FirebaseApp;
    firestore?: (...params: Parameters<typeof initializeFirestore>) => Firestore;
    auth?: (...params: Parameters<typeof initializeAuth>) => Auth;
    storage?: (...params: Parameters<typeof getStorage>) => FirebaseStorage;
    functions?: (...params: Parameters<typeof getFunctions>) => Functions;
    database?: (...params: Parameters<typeof getDatabase>) => Database;
    analytics?: (...params: Parameters<typeof initializeAnalytics>) => Analytics;
}
export declare const FIREBASE_APP_SETTINGS: InjectionToken<FirebaseAppSettings>;
export declare const FIREBASE_CONFIG: InjectionToken<FirebaseConfig>;
export declare const REGION_OR_DOMAIN: InjectionToken<string>;
export declare const FIRESTORE_SETTINGS: InjectionToken<FirestoreSettings>;
export declare const ANALYTICS_SETTINGS: InjectionToken<AnalyticsSettings>;
export declare const STORAGE_BUCKET: InjectionToken<string>;
export declare const DB_URL: InjectionToken<string>;
export declare const AUTH_DEPS: InjectionToken<Dependencies>;
export declare function getConfig(): FirebaseConfig;
