import type { CollectionReference, DocumentReference, Query } from "firebase/firestore";
import { Params } from "./types";
export declare function exist<D>(doc: D | undefined | null): doc is D;
export declare function isNotUndefined<D>(doc: D | undefined): doc is D;
export declare function isDocPath(path: string): boolean;
export declare function isPathRef(path?: any): path is string;
export declare function isIdList(idsOrQuery: any[]): idsOrQuery is string[];
/** Get the params from a path */
export declare function getPathParams(path: string): string[];
export declare function assertPath(path: string): void;
export declare function assertCollection(path: string): void;
/**
 * Transform a path based on the params
 * @param path The path with params starting with "/:"
 * @param params A map of id params
 * @example pathWithParams('movies/:movieId/stakeholder/:shId', { movieId, shId })
 */
export declare function pathWithParams(path: string, params?: Params): string;
export declare function isQuery<E>(ref: CollectionReference<E> | DocumentReference<E> | Query<E>): ref is Query<E>;
export declare function isCollectionRef<E>(ref: CollectionReference<E> | DocumentReference<E> | Query<E>): ref is CollectionReference<E>;
