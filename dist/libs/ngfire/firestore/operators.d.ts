import type { DocumentData, DocumentReference, DocumentSnapshot, Query, QuerySnapshot, SnapshotListenOptions } from "firebase/firestore";
import { Observable } from "rxjs";
export declare function fromRef<T = DocumentData>(ref: DocumentReference<T>, options?: SnapshotListenOptions): Observable<DocumentSnapshot<T>>;
export declare function fromRef<T = DocumentData>(ref: Query<T>, options?: SnapshotListenOptions): Observable<QuerySnapshot<T>>;
export declare function fromRef<T = DocumentData>(ref: DocumentReference<T> | Query<T>, options: SnapshotListenOptions): Observable<DocumentSnapshot<T>> | Observable<QuerySnapshot<T>>;
