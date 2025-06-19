import { Observable } from 'rxjs';
import { DataSnapshot } from 'firebase/database';
import type { Query } from 'firebase/database';
/**
 * Create an observable from a Database Reference or Database Query.
 * @param query Database Reference
 */
export declare function fromQuery(query: Query): Observable<DataSnapshot>;
