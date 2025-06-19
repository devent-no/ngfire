import { DatabaseReference, DataSnapshot, Query, QueryConstraint } from "firebase/database";
import { Observable } from "rxjs";
import { ExtractDeepKeys, Params } from "ngfire/core";
import { FireDatabase } from "./database";
export declare function addMeta(doc: DocumentMeta, actionType: 'add' | 'update'): void;
export interface DocumentMeta {
    _meta: {
        createdAt?: Date;
        modifiedAt?: Date;
    };
}
export declare abstract class FireList<E> {
    protected fireDB: FireDatabase;
    protected abstract readonly path: string;
    protected abstract dateKeys: ExtractDeepKeys<E, Date>[];
    protected idKey?: keyof E;
    protected pathKey?: keyof E;
    protected fromDatabase(snap: DataSnapshot): E | null;
    protected toDatabase(doc: Partial<E>, actionType: 'add' | 'update'): Partial<E>;
    private toData;
    getPath(key?: string | Params, params?: Params): string;
    getRef(): DatabaseReference;
    getRef(params: Params): DatabaseReference;
    getRef(key: string, params?: Params): DatabaseReference;
    getRef(keys: string[], params?: Params): DatabaseReference[];
    getRef(constraints: QueryConstraint[], params?: Params): Query;
    getRef(query?: string | string[] | QueryConstraint[] | Params, params?: Params): DatabaseReference | DatabaseReference[] | Query;
    private fromQuery;
    private getQuery;
    valueChanges<T extends E = E>(): Observable<T[]>;
    valueChanges<T extends E = E>(params: Params): Observable<T[]>;
    valueChanges<T extends E = E>(key: string, params?: Params): Observable<T | null>;
    valueChanges<T extends E = E>(keys: string[], params?: Params): Observable<T[]>;
    valueChanges<T extends E = E>(constraints: QueryConstraint[], params?: Params): Observable<T[]>;
    getValue<T extends E = E>(): Promise<T[]>;
    getValue<T extends E = E>(params: Params): Promise<T[]>;
    getValue<T extends E = E>(key: string, params?: Params): Promise<T | null>;
    getValue<T extends E = E>(keys: string[], params?: Params): Promise<T[]>;
    getValue<T extends E = E>(constraints: QueryConstraint[], params?: Params): Promise<T[]>;
    add<T extends E>(value: Partial<T>, params?: Params): Promise<void> | import("@firebase/database").ThenableReference;
    update<T extends E>(key: string, value: Partial<T>, params?: Params): Promise<void>;
    remove(key: string, params?: Params): Promise<void>;
    /** We use a separated method to avoid mistakes */
    removeAll(params?: Params): Promise<void>;
}
