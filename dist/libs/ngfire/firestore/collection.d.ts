import { NgZone } from '@angular/core';
import { Query, Transaction, DocumentSnapshot } from 'firebase/firestore';
import type { DocumentData, CollectionReference, DocumentReference, QueryConstraint, QueryDocumentSnapshot, QuerySnapshot, WriteBatch } from 'firebase/firestore';
import type { WriteOptions, UpdateCallback, Params, FireEntity, DeepKeys } from 'ngfire/core';
import { Observable } from 'rxjs';
import { FirestoreService } from './firestore';
export declare abstract class FireCollection<E extends DocumentData> {
    protected platformId: Object;
    protected zone: NgZone;
    protected firestore: FirestoreService;
    protected abstract readonly path: string;
    protected idKey: DeepKeys<E>;
    /** If true, will store the document id (IdKey) onto the document */
    protected storeId: boolean;
    /**
     * Cache the snapshot into a global store
     */
    protected memorize: boolean;
    /**
     * Delay before unsubscribing to a query (used only with memorized is true)
     * Use Infinty for application long subscription
     */
    protected delayToUnsubscribe: number;
    protected onCreate?(entity: E, options: WriteOptions): unknown;
    protected onUpdate?(entity: FireEntity<E>, options: WriteOptions): unknown;
    protected onDelete?(id: string, options: WriteOptions): unknown;
    protected get db(): import("@firebase/firestore").Firestore;
    protected useCache<T extends E>(ref: DocumentReference<T>): Observable<T>;
    protected useCache<T extends E>(ref: Query<T>): Observable<T[]>;
    protected useCache<T extends E>(ref: DocumentReference<T> | Query<T>): Observable<T | T[]>;
    protected clearCache<T extends E>(refs: CollectionReference<T> | DocumentReference<T> | Query<T> | DocumentReference<T>[]): void;
    /** Function triggered when adding/updating data to firestore */
    protected toFirestore(entity: FireEntity<E>, actionType: 'add' | 'update'): any | Promise<any>;
    /** Function triggered when getting data from firestore */
    protected fromFirestore(snapshot: DocumentSnapshot<E> | QueryDocumentSnapshot<E>): E | undefined;
    batch(): WriteBatch;
    runTransaction<T>(cb: (transaction: Transaction) => Promise<T>): Promise<T>;
    createId(): string;
    /** Get the content of the snapshot */
    protected snapToData<T extends E = E>(snap: DocumentSnapshot<T>): T;
    protected snapToData<T extends E = E>(snap: DocumentSnapshot<T>[]): T[];
    protected snapToData<T extends E = E>(snap: QuerySnapshot<T>): T[];
    protected snapToData<T extends E = E>(snap: QuerySnapshot<T> | DocumentSnapshot<T> | DocumentSnapshot<T>[]): T | T[];
    /** Get the content of reference(s) */
    protected getFromRef<T extends E = E>(ref: DocumentReference<T>): Promise<T | undefined>;
    protected getFromRef<T extends E = E>(ref: DocumentReference<T>[]): Promise<T[]>;
    protected getFromRef<T extends E = E>(ref: CollectionReference<T> | Query<T>): Promise<T[]>;
    protected getFromRef<T extends E = E>(ref: DocumentReference<T> | DocumentReference<T>[] | CollectionReference<T> | Query<T>): Promise<undefined | T | T[]>;
    /** Observable the content of reference(s)  */
    protected fromRef<T extends E = E>(ref: DocumentReference<T>): Observable<T | undefined>;
    protected fromRef<T extends E = E>(ref: DocumentReference<T>[]): Observable<T[]>;
    protected fromRef<T extends E = E>(ref: CollectionReference<T> | Query<T>): Observable<T[]>;
    protected fromRef<T extends E = E>(ref: DocumentReference<T> | DocumentReference<T>[] | CollectionReference<T> | Query<T>): Observable<undefined | T | T[]>;
    /** Get the reference of the document, collection or query */
    getRef<T extends E = E>(): CollectionReference<T>;
    getRef<T extends E = E>(ids: string[], params?: Params): DocumentReference<T>[];
    getRef<T extends E = E>(constraints: QueryConstraint[], params: Params): Query<T>;
    getRef<T extends E = E>(id: string, params?: Params): DocumentReference<T>;
    getRef<T extends E = E>(path: string, params?: Params): DocumentReference<T> | CollectionReference<T>;
    getRef<T extends E = E>(params: Params): CollectionReference<T>;
    getRef<T extends E = E>(ids?: string | string[] | Params | QueryConstraint[], params?: Params): undefined | Query<T> | CollectionReference<T> | DocumentReference<T> | DocumentReference<T>[];
    /** Clear cache and get the latest value into the cache */
    reload<T extends E = E>(ids?: string[]): Promise<T[]>;
    reload<T extends E = E>(query?: QueryConstraint[]): Promise<T[]>;
    reload<T extends E = E>(id?: string | null): Promise<T | undefined>;
    reload<T extends E = E>(idOrQuery?: string | string[] | QueryConstraint[] | null): Promise<T | T[] | undefined>;
    /** Get the last content from the app (if value has been cached, it won't do a server request) */
    load<T extends E = E>(ids?: string[]): Promise<T[]>;
    load<T extends E = E>(query?: QueryConstraint[]): Promise<T[]>;
    load<T extends E = E>(id?: string | null): Promise<T | undefined>;
    load<T extends E = E>(idOrQuery?: string | string[] | QueryConstraint[] | null): Promise<T | T[] | undefined>;
    /** Return the current value of the path from Firestore */
    getValue<T extends E = E>(ids?: string[]): Promise<T[]>;
    getValue<T extends E = E>(query?: QueryConstraint[]): Promise<T[]>;
    getValue<T extends E = E>(id?: string | null): Promise<T | undefined>;
    getValue<T extends E = E>(idOrQuery?: null | string | string[] | QueryConstraint[]): Promise<T | T[] | undefined>;
    /** Listen to the changes of values of the path from Firestore */
    valueChanges<T extends E = E>(ids?: string[]): Observable<T[]>;
    valueChanges<T extends E = E>(query?: QueryConstraint[]): Observable<T[]>;
    valueChanges<T extends E = E>(id?: string | null): Observable<T | undefined>;
    valueChanges<T extends E = E>(idOrQuery?: string | string[] | QueryConstraint[] | null): Observable<T | T[] | undefined>;
    /**
     * Create or update documents
     * @param documents One or many documents
     * @param options options to write the document on firestore
     */
    upsert<T extends E>(documents: FireEntity<T>, options?: WriteOptions): Promise<string>;
    upsert<T extends E>(documents: FireEntity<T>[], options?: WriteOptions): Promise<string[]>;
    /**
     * Add a document or a list of document to Firestore
     * @param docs A document or a list of document
     * @param options options to write the document on firestore
     */
    add<T extends E>(documents: FireEntity<T>, options?: WriteOptions): Promise<string>;
    add<T extends E>(documents: FireEntity<T>[], options?: WriteOptions): Promise<string[]>;
    /**
     * Remove one or several document from Firestore
     * @param id A unique or list of id representing the document
     * @param options options to write the document on firestore
     */
    remove<T extends E>(id: string | string[], options?: WriteOptions): Promise<void>;
    /** Remove all document of the collection */
    removeAll(options?: WriteOptions): Promise<void>;
    /**
     * Update one or several document in Firestore
     */
    update<T extends E>(entity: FireEntity<T> | FireEntity<T>[], options?: WriteOptions): Promise<void>;
    update<T extends E>(id: string | string[], entityChanges: FireEntity<T>, options?: WriteOptions): Promise<void>;
    update<T extends E>(ids: string | string[], stateFunction: UpdateCallback<T>, options?: WriteOptions): Promise<Transaction[]>;
}
