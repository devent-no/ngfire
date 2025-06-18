import { Injector } from "@angular/core";
import { QueryConstraint, DataSnapshot } from 'firebase/database';
import type { DatabaseReference, Query } from 'firebase/database';
import { Observable } from "rxjs";
import { Params } from "ngfire/core";
import * as i0 from "@angular/core";
export declare function isContraintList(idsOrQuery: any[]): idsOrQuery is QueryConstraint[];
export declare class FireDatabase {
    protected injector: Injector;
    protected memory: Map<Query, Observable<DataSnapshot>>;
    get db(): import("@firebase/database").Database;
    /** Get the reference of the document, collection or query */
    getRef(path: string, params?: Params): DatabaseReference;
    getRef(paths: string[], params?: Params): DatabaseReference[];
    getRef(path: string, constraints: QueryConstraint[], params?: Params): Query;
    getRef(paths: string[], constraints: QueryConstraint[], params?: Params): Query;
    getRef(paths: string, constraints?: Params | QueryConstraint[], params?: Params): Query | DatabaseReference;
    fromQuery(query: Query): Observable<DataSnapshot>;
    create<T>(path: string, content: T): Promise<void>;
    update<T>(path: string, value: Partial<T>): Promise<void>;
    remove(path: string): Promise<void>;
    static ɵfac: i0.ɵɵFactoryDeclaration<FireDatabase, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FireDatabase>;
}
