import { UploadMetadata } from "firebase/storage";
import * as i0 from "@angular/core";
export declare class FireStorage {
    private injector;
    protected bucket?: string;
    protected get storage(): import("@firebase/storage").FirebaseStorage;
    ref(url: string): import("@firebase/storage").StorageReference;
    upload(url: string, bytes: Blob | Uint8Array | ArrayBuffer, metadata?: UploadMetadata): import("@firebase/storage").UploadTask;
    static ɵfac: i0.ɵɵFactoryDeclaration<FireStorage, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FireStorage>;
}
