export declare const storageEmulator: (host: string, port: number, options?: {
    mockUserToken?: string | import("@firebase/util").EmulatorMockTokenOptions | undefined;
} | undefined) => (app?: import("@firebase/app").FirebaseApp | undefined, bucketUrl?: string | undefined) => import("@firebase/storage").FirebaseStorage;
