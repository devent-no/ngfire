import { Injector } from "@angular/core";
import { UserCredential, AuthProvider, User } from "firebase/auth";
import type { DocumentSnapshot, DocumentReference } from 'firebase/firestore';
import { AtomicWrite, UpdateCallback } from 'ngfire/core';
import { Observable } from "rxjs";
import * as i0 from "@angular/core";
export interface AuthWriteOptions<Ctx = any> {
    write?: AtomicWrite;
    ctx?: Ctx;
    collection?: null | string;
}
/**
 * Get the custom claims of a user. If no key is provided, return the whole claims object
 * @param user The user object returned by Firebase Auth
 * @param roles Keys of the custom claims inside the claim objet
 */
export declare function getCustomClaims<Claims extends Record<string, any>>(user: User, keys?: string | string[]): Promise<Claims>;
export declare function isUpdateCallback<T>(update: UpdateCallback<T> | Partial<T>): update is UpdateCallback<T>;
export declare abstract class BaseFireAuth<Profile, Roles extends Record<string, any> | undefined = undefined> {
    private memoProfile;
    private platformId;
    protected getAuth: import("@firebase/auth").Auth;
    protected injector: Injector;
    private zone;
    protected abstract path: string | undefined;
    protected idKey: string;
    protected verificationUrl?: string;
    protected abstract signin(...arg: any[]): Promise<UserCredential>;
    protected abstract signout(): Promise<void>;
    protected get db(): import("@firebase/firestore").Firestore;
    get auth(): import("@firebase/auth").Auth;
    get user(): User | null;
    user$: Observable<User | null>;
    /**
     * Observe current user. Doesn't emit if there are no user connected.
     * Use `user` if you need to know if user is connected
     */
    currentUser$: Observable<User>;
    /** Listen on changes from the authenticated user */
    profile$: Observable<Profile | undefined>;
    /** Triggered when the profile has been created */
    protected onCreate?(profile: Partial<Profile>, options: AuthWriteOptions): unknown;
    /** Triggered when the profile has been updated */
    protected onUpdate?(profile: Partial<Profile>, options: AuthWriteOptions): unknown;
    /** Triggered when the profile has been deleted */
    protected onDelete?(options: AuthWriteOptions): unknown;
    /** Triggered when user signin for the first time or signup with email & password */
    protected onSignup?(credential: UserCredential, options: AuthWriteOptions): unknown;
    /** Triggered when a user signin, except for the first time @see onSignup */
    protected onSignin?(credential: UserCredential): unknown;
    /** Triggered when a user signout */
    protected onSignout?(): unknown;
    protected useMemo(ref: DocumentReference<Profile>): Observable<DocumentSnapshot<Profile, import("@firebase/firestore").DocumentData>>;
    /**
     * Select the roles for this user. Can be in custom claims or in a Firestore collection
     * @param user The user given by FireAuth
     * @see getCustomClaims to get the custom claims out of the user
     * @note Can be overwritten
     */
    protected selectRoles(user: User): Promise<Roles> | Observable<Roles>;
    /**
     * Function triggered when getting data from firestore
     * @note should be overwritten
     */
    protected fromFirestore(snapshot: DocumentSnapshot<Profile>): Profile | undefined;
    /**
     * Function triggered when adding/updating data to firestore
     * @note should be overwritten
     */
    protected toFirestore(profile: Partial<Profile>, actionType: 'add' | 'update'): any;
    /**
     * Function triggered when transforming a user into a profile
     * @param user The user object from FireAuth
     * @param ctx The context given on signup
     */
    protected createProfile(user: User, ctx?: any): Promise<Partial<Profile>> | Partial<Profile>;
    /** Triggerd when creating or getting a user */
    protected useCollection(user: User): undefined | null | string | Promise<undefined | null | string>;
    /** If user connected, return its document in Firestore,  */
    protected getRef(options?: {
        user?: User | null;
        collection?: string | null;
    }): DocumentReference<Profile, import("@firebase/firestore").DocumentData> | undefined;
    /** Return current user. Only return when auth has emit */
    awaitUser(): Promise<User | null>;
    /** Get the current user Profile from Firestore */
    getValue(): Promise<Profile | undefined>;
    /**
     * @description Delete user from authentication service and database
     * WARNING This is security sensitive operation
     */
    delete(options?: AuthWriteOptions): Promise<void>;
    /** Update the current profile of the authenticated user */
    update(profile: Partial<Profile> | UpdateCallback<Profile>, options?: AuthWriteOptions): Promise<void | import("@firebase/firestore").Transaction>;
    /** Manage the creation of the user into Firestore */
    protected create(cred: UserCredential, options: AuthWriteOptions): Promise<UserCredential>;
    static ɵfac: i0.ɵɵFactoryDeclaration<BaseFireAuth<any, any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<BaseFireAuth<any, any>>;
}
export declare abstract class FireAuth<Profile, Roles extends Record<string, any> | undefined = undefined> extends BaseFireAuth<Profile, Roles> {
    protected abstract path: string | undefined;
    /**
     * Create a user based on email and password
     * Will send a verification email to the user if verificationURL is provided config
     */
    signup(email: string, password: string, options?: AuthWriteOptions): Promise<UserCredential>;
    /** Signin with email & password, provider name, provider objet or custom token */
    signin(email: string, password: string, options?: AuthWriteOptions): Promise<UserCredential>;
    signin(authProvider: AuthProvider, options?: AuthWriteOptions): Promise<UserCredential>;
    signin(token: string, options?: AuthWriteOptions): Promise<UserCredential>;
    /** Signs out the current user and clear the store */
    signout(): Promise<void>;
    static ɵfac: i0.ɵɵFactoryDeclaration<FireAuth<any, any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FireAuth<any, any>>;
}
