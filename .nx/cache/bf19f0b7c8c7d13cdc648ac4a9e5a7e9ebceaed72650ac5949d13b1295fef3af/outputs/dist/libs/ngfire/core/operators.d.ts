import { Observable, OperatorFunction } from 'rxjs';
export declare function shareWithDelay<T>(delay?: number): import("rxjs").MonoTypeOperatorFunction<T>;
type QueryMap<T> = Record<string, (data: Entity<T>) => any>;
type Entity<T> = T extends Array<infer I> ? I : T;
type GetSnapshot<F extends (...data: any) => any> = F extends (...data: any) => Observable<infer I> ? I : F extends (...data: any) => Promise<infer J> ? J : ReturnType<F>;
type Join<T, Query extends QueryMap<T>> = T & {
    [key in keyof Query]?: GetSnapshot<Query[key]>;
};
type Jointure<T, Query extends QueryMap<any>> = T extends Array<infer I> ? Join<I, Query>[] : Join<T, Query>;
interface JoinWithOptions {
    /** If set to false, the subqueries will be filled with undefined and hydrated as they come through */
    shouldAwait?: boolean;
    /** Used to not trigger change detection too often */
    debounceTime?: number;
}
/**
 * Operator that join the source with sub queries.
 * There are two stategies :
 * 1. `shouldAwait: true`: Await all subqueries to emit once before emitting a next value
 * 2. `shouldAwait: false`: Emit the source and hydrate it with the subqueries along the way
 * @example
 * ```typescript
 * of({ docUrl: '...' }).valueChanges().pipe(
 *   joinWith({
 *     doc: source => fetch(docUrl).then(res => res.json()),
 *   }, { shouldAwait: true })
 * ).subscribe(res => console.log(res.subQuery))
 * ```
 * @param queries A map of subqueries to apply. Each query can return a static value, Promise or Observable
 * @param options Strategy to apply on the joinWith
 */
export declare function joinWith<T, Query extends QueryMap<T>>(queries: Query, options?: JoinWithOptions): OperatorFunction<T, Jointure<T, Query>>;
export {};
