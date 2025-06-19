import { DocumentData, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import type { Transaction, CollectionReference, DocumentReference, Query, QueryConstraint } from 'firebase/firestore';
import { Observable } from "rxjs";
import * as i0 from "@angular/core";
type Reference<E> = CollectionReference<E> | DocumentReference<E>;
type Snapshot<E = DocumentData> = DocumentSnapshot<E> | QuerySnapshot<E>;
export declare class FirestoreService {
    private memoryRef;
    private injector;
    private plateformId;
    /** Transfer state between server and  */
    private transferState;
    /** Cache based state for document */
    private state;
    get db(): import("@firebase/firestore").Firestore;
    /** @internal Should only be used by FireCollection services */
    setState<E>(ref: DocumentReference<E> | CollectionReference<E> | Query<E>, snap: Snapshot<E>): void;
    getState<E>(ref: DocumentReference<E>, delay?: number): DocumentSnapshot<E>;
    getState<E>(ref: CollectionReference<E>, delay?: number): QuerySnapshot<E>;
    getState<E>(ref: Query<E>, delay?: number): QuerySnapshot<E>;
    getState<E>(ref: DocumentReference<E> | CollectionReference<E> | Query<E>): Snapshot<E> | undefined;
    /** @internal Should only be used by FireCollection services */
    fromMemory<E>(ref: DocumentReference<E>, delay?: number): Observable<DocumentSnapshot<E>>;
    fromMemory<E>(ref: CollectionReference<E>, delay?: number): Observable<QuerySnapshot<E>>;
    fromMemory<E>(ref: Query<E>, delay?: number): Observable<QuerySnapshot<E>>;
    fromMemory<E>(ref: DocumentReference<E> | CollectionReference<E> | Query<E>, delay?: number): Observable<Snapshot<E>>;
    /**
     * @internal Should only be used by FireCollection services
     * Get the transfer state for a specific ref and put it in the memory state
     * Remove the reference to transfer state after first call
     */
    getTransfer<E>(ref: DocumentReference<E>): E | undefined;
    getTransfer<E>(ref: CollectionReference<E> | Query<E>): E[] | undefined;
    getTransfer<E>(ref: DocumentReference<E> | CollectionReference<E> | Query<E>): E[] | E | undefined;
    /** @internal Should only be used by FireCollection services */
    setTransfer<E>(ref: DocumentReference<E>, value?: E): void;
    setTransfer<E>(ref: DocumentReference<E>[] | CollectionReference<E> | Query<E>, value?: E[]): void;
    setTransfer<E>(ref: DocumentReference<E> | DocumentReference<E>[] | CollectionReference<E> | Query<E>, value?: E | E[]): void;
    clearCache(paths: string | string[] | Query): void;
    /** Get the reference of the document, collection or query */
    getRef<E>(path: string): Reference<E>;
    getRef<E>(paths: string[]): DocumentReference<E>[];
    getRef<E>(path: string, constraints: QueryConstraint[]): Query<E>;
    batch(): import("@firebase/firestore").WriteBatch;
    runTransaction<T>(cb: (transaction: Transaction) => Promise<T>): Promise<T>;
    createId(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<FirestoreService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FirestoreService>;
}
export {};
