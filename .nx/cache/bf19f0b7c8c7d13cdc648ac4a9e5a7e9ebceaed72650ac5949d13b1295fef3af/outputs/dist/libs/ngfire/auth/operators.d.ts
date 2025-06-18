import type { Auth, User } from "firebase/auth";
import { Observable } from "rxjs";
export declare function user(auth: Auth): Observable<User | null>;
