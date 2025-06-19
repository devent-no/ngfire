import { NgZone } from '@angular/core';
import { Transaction, DocumentSnapshot } from 'firebase/firestore';
import type { DocumentData, DocumentReference, QueryDocumentSnapshot, WriteBatch } from 'firebase/firestore';
import type { WriteOptions, UpdateCallback, Params, FireEntity, DeepKeys } from 'ngfire/core';
import { Observable } from 'rxjs';
import { FirestoreService } from './firestore';
export declare abstract class FireDocument<E extends DocumentData> {
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
    protected onDelete?(path: string, options: WriteOptions): unknown;
    protected get db(): import("@firebase/firestore").Firestore;
    protected useCache<T extends E>(ref: DocumentReference<T>): Observable<T | undefined>;
    protected clearCache<T extends E>(ref: DocumentReference<T>): void;
    /** Function triggered when adding/updating data to firestore */
    protected toFirestore<T extends E = E>(entity: FireEntity<T>, actionType: 'create' | 'update'): any | Promise<any>;
    /** Function triggered when getting data from firestore */
    protected fromFirestore<T extends E = E>(snapshot: DocumentSnapshot<T> | QueryDocumentSnapshot<T>): Promise<T> | T | undefined;
    batch(): WriteBatch;
    runTransaction<T>(cb: (transaction: Transaction) => Promise<T>): Promise<T>;
    createId(params?: Params): string;
    /** Get the content of the snapshot */
    protected snapToData<T extends E = E>(snap: DocumentSnapshot<T>): T | Promise<T> | undefined;
    /** Get the content of reference(s) */
    protected getFromRef<T extends E = E>(ref: DocumentReference<T>): Promise<T | undefined>;
    /** Observable the content of reference(s)  */
    protected fromRef<T extends E = E>(ref: DocumentReference<T>): Observable<T | undefined>;
    /** Get the reference of the document, collection or query */
    getRef<T extends E>(parameters?: Params): DocumentReference<T>;
    /** Clear cache and get the latest value into the cache */
    reload<T extends E = E>(parameters?: Params): Promise<T | undefined>;
    /** Get the last content from the app (if value has been cached, it won't do a server request) */
    load<T extends E>(parameters?: Params): Promise<T | undefined>;
    /** Return the current value of the document from Firestore */
    getValue<T extends E = E>(parameters?: Params): Promise<T | undefined>;
    /** Listen to the changes of values of the document from Firestore */
    valueChanges<T extends E = E>(parameters?: Params): Observable<T | undefined>;
    /**
     * Create or update the document
     * @param document The document to upsert
     * @param options options to write the document on firestore
     */
    upsert<T extends E>(document: FireEntity<T>, options?: WriteOptions): Promise<string>;
    /**
     * Create the document at the specified path
     * @param document The document to create
     * @param options options to write the document on firestore
     */
    create<T extends E>(document: FireEntity<T>, options?: WriteOptions): Promise<string>;
    /**
     * Delete the document from firestore
     * @param options options to write the document on firestore
     */
    delete<T extends E>(options?: WriteOptions): Promise<void>;
    /** Update document in Firestore */
    update<T extends E>(document: FireEntity<T>, options?: WriteOptions): Promise<void>;
    update<T extends E>(documentChanges: UpdateCallback<T>, options?: WriteOptions): Promise<void>;
}
