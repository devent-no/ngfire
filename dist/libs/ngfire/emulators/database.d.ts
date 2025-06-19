export declare const databaseEmulator: (host: string, port: number, options?: {
    mockUserToken?: string | import("@firebase/util").EmulatorMockTokenOptions | undefined;
} | undefined) => (app?: import("@firebase/app").FirebaseApp | undefined, url?: string | undefined) => import("@firebase/database").Database;
