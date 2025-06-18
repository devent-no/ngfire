import type { QueryDocumentSnapshot, DocumentSnapshot, Query, QueryConstraint, DocumentData } from 'firebase/firestore';
import { Params } from 'ngfire/core';
import { FireCollection } from "./collection";
import { Observable } from "rxjs";
export declare abstract class FireSubCollection<E extends DocumentData> extends FireCollection<E> {
    abstract path: string;
    protected pathKey: string;
    get groupId(): string;
    /** Function triggered when getting data from firestore */
    protected fromFirestore(snapshot: DocumentSnapshot<E> | QueryDocumentSnapshot<E>): E | undefined;
    getGroupRef<T extends E = E>(constraints?: QueryConstraint[]): Query<T> | undefined;
    /** Observable the content of group reference(s)  */
    protected fromGroupRef<T extends E = E>(ref: Query<T>): Observable<T[]>;
    /** Return the current value of the path from Firestore */
    getValue<T extends E = E>(ids?: string[], params?: Params): Promise<T[]>;
    getValue<T extends E = E>(params: Params): Promise<T[]>;
    getValue<T extends E = E>(query?: QueryConstraint[], params?: Params): Promise<T[]>;
    getValue<T extends E = E>(id?: string | null, params?: Params): Promise<T | undefined>;
    /** Clear cache and get the latest value into the cache */
    reload<T extends E = E>(ids?: string[], params?: Params): Promise<T[]>;
    reload<T extends E = E>(params: Params): Promise<T[]>;
    reload<T extends E = E>(query?: QueryConstraint[], params?: Params): Promise<T[]>;
    reload<T extends E = E>(id?: string | null, params?: Params): Promise<T | undefined>;
    /** Get the last content from the app (if value has been cached, it won't do a server request)  */
    load<T extends E = E>(ids?: string[], params?: Params): Promise<T[]>;
    load<T extends E = E>(params: Params): Promise<T[]>;
    load<T extends E = E>(query?: QueryConstraint[], params?: Params): Promise<T[]>;
    load<T extends E = E>(id?: string, params?: Params): Promise<T | undefined>;
    load<T extends E = E>(idOrQuery?: string | string[] | QueryConstraint[] | Params, params?: Params): Promise<T | T[] | undefined>;
    /** Return the current value of the path from Firestore */
    valueChanges<T extends E = E>(ids?: string[], params?: Params): Observable<T[]>;
    valueChanges<T extends E = E>(params: Params): Observable<T[]>;
    valueChanges<T extends E = E>(query?: QueryConstraint[], params?: Params): Observable<T[]>;
    valueChanges<T extends E = E>(id?: string, params?: Params): Observable<T | undefined>;
    valueChanges<T extends E = E>(idOrQuery?: string | string[] | QueryConstraint[] | Params, params?: Params): Observable<T | T[] | undefined>;
}
