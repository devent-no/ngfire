export declare const firestoreEmulator: (host: string, port: number, options?: {
    mockUserToken?: string | import("@firebase/util").EmulatorMockTokenOptions | undefined;
} | undefined) => (app: import("@firebase/app").FirebaseApp, settings: import("@firebase/firestore").FirestoreSettings, databaseId?: string | undefined) => import("@firebase/firestore").Firestore;
