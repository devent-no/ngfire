import { Observable } from 'rxjs';
import type { UploadTaskSnapshot, UploadTask } from 'firebase/storage';
export declare function fromTask(task: UploadTask): Observable<UploadTaskSnapshot>;
export interface PercentageSnapshot {
    progress: number;
    snapshot: UploadTaskSnapshot;
}
export declare function percentage(task: UploadTask): Observable<PercentageSnapshot>;
