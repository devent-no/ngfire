type OrderBy = any;
type FieldFilter = any;
import type { Query } from 'firebase/firestore';
export declare function stringifyQuery(query: Query): string;
/** Returns a debug description for `filter`. */
export declare function stringifyFilter(filter: FieldFilter): string;
export declare function stringifyOrderBy(orderBy: OrderBy): string;
export {};
