import { inject, Injectable, Injector, NgZone, PLATFORM_ID } from "@angular/core";
import { isPlatformServer } from "@angular/common";
import { doc, getDoc, writeBatch, runTransaction } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, signInAnonymously, signInWithPopup, signInWithCustomToken, getAdditionalUserInfo } from "firebase/auth";
import { user } from './operators';
import { fromRef, toDate, FIRESTORE } from 'ngfire/firestore';
import { shareWithDelay, keepUnstableUntilFirst } from 'ngfire/core';
import { filter, map, switchMap, shareReplay } from "rxjs/operators";
import { firstValueFrom, from, of } from "rxjs";
import { FIRE_AUTH } from "./tokens";
import * as i0 from "@angular/core";
const exist = (v) => v !== null && v !== undefined;
/**
 * Get the custom claims of a user. If no key is provided, return the whole claims object
 * @param user The user object returned by Firebase Auth
 * @param roles Keys of the custom claims inside the claim objet
 */
export async function getCustomClaims(user, keys) {
    if (!user)
        return {};
    const { claims } = await user.getIdTokenResult();
    if (!keys)
        return claims;
    const fields = Array.isArray(keys) ? keys : [keys];
    const result = {};
    for (const key of fields) {
        if (claims[key]) {
            result[key] = claims[key];
        }
    }
    return result;
}
export function isUpdateCallback(update) {
    return typeof update === 'function';
}
export class BaseFireAuth {
    constructor() {
        this.memoProfile = {};
        this.platformId = inject(PLATFORM_ID);
        this.getAuth = inject(FIRE_AUTH);
        this.injector = inject(Injector);
        this.zone = inject(NgZone);
        this.idKey = 'id';
        this.user$ = isPlatformServer(this.platformId)
            ? this.zone.runOutsideAngular(() => user(this.auth))
            : user(this.auth).pipe(shareReplay({ refCount: true, bufferSize: 1 }));
        /**
         * Observe current user. Doesn't emit if there are no user connected.
         * Use `user` if you need to know if user is connected
         */
        this.currentUser$ = this.user$.pipe(filter(exist));
        /** Listen on changes from the authenticated user */
        this.profile$ = this.user$.pipe(map((user) => this.getRef({ user })), switchMap((ref) => (ref ? this.useMemo(ref) : of(undefined))), map(snapshot => snapshot ? this.fromFirestore(snapshot) : undefined));
    }
    get db() {
        return this.injector.get(FIRESTORE);
    }
    get auth() {
        return this.injector.get(FIRE_AUTH);
    }
    get user() {
        return this.auth.currentUser;
    }
    useMemo(ref) {
        if (isPlatformServer(this.platformId)) {
            return this.zone.runOutsideAngular(() => from(getDoc(ref))).pipe(keepUnstableUntilFirst(this.zone));
        }
        if (!this.memoProfile[ref.path]) {
            this.memoProfile[ref.path] = fromRef(ref).pipe(shareWithDelay(100));
        }
        return this.memoProfile[ref.path];
    }
    /**
     * Select the roles for this user. Can be in custom claims or in a Firestore collection
     * @param user The user given by FireAuth
     * @see getCustomClaims to get the custom claims out of the user
     * @note Can be overwritten
     */
    selectRoles(user) {
        return getCustomClaims(user);
    }
    /**
     * Function triggered when getting data from firestore
     * @note should be overwritten
     */
    fromFirestore(snapshot) {
        return snapshot.exists()
            ? { ...toDate(snapshot.data()), [this.idKey]: snapshot.id }
            : undefined;
    }
    /**
     * Function triggered when adding/updating data to firestore
     * @note should be overwritten
     */
    toFirestore(profile, actionType) {
        if (actionType === 'add') {
            const _meta = { createdAt: new Date(), modifiedAt: new Date() };
            return { _meta, ...profile };
        }
        else {
            return { ...profile, '_meta.modifiedAt': new Date() };
        }
    }
    /**
     * Function triggered when transforming a user into a profile
     * @param user The user object from FireAuth
     * @param ctx The context given on signup
     */
    createProfile(user, ctx) {
        return { avatar: user?.photoURL, displayName: user?.displayName };
    }
    /** Triggerd when creating or getting a user */
    useCollection(user) {
        return this.path ?? null;
    }
    /** If user connected, return its document in Firestore,  */
    getRef(options = {}) {
        const user = options.user ?? this.user;
        if (user) {
            return doc(this.db, `${this.path}/${user.uid}`);
        }
        return;
    }
    /** Return current user. Only return when auth has emit */
    awaitUser() {
        return firstValueFrom(this.user$);
    }
    /** Get the current user Profile from Firestore */
    async getValue() {
        const ref = this.getRef();
        if (ref) {
            const snapshot = await getDoc(ref);
            return this.fromFirestore(snapshot);
        }
        return;
    }
    /**
     * @description Delete user from authentication service and database
     * WARNING This is security sensitive operation
     */
    async delete(options = {}) {
        const user = this.user;
        const ref = this.getRef({ user });
        if (!user || !ref) {
            throw new Error('No user connected');
        }
        const { write = writeBatch(this.db), ctx } = options;
        write.delete(ref);
        if (this.onDelete)
            await this.onDelete({ write, ctx });
        if (!options.write) {
            await write.commit();
        }
        return user.delete();
    }
    /** Update the current profile of the authenticated user */
    async update(profile, options = {}) {
        const ref = this.getRef();
        if (!ref) {
            throw new Error('No user connected.');
        }
        if (isUpdateCallback(profile)) {
            return runTransaction(this.db, async (tx) => {
                const snapshot = (await tx.get(ref));
                const doc = this.fromFirestore(snapshot);
                if (!doc) {
                    throw new Error(`Could not find document at "${this.path}/${snapshot.id}"`);
                }
                const data = await profile(this.toFirestore(doc, 'update'), tx);
                tx.update(ref, data);
                if (this.onUpdate)
                    await this.onUpdate(data, { write: tx, ctx: options.ctx });
                return tx;
            });
        }
        else if (typeof profile === 'object') {
            const { write = writeBatch(this.db), ctx } = options;
            write.update(ref, this.toFirestore(profile, 'update'));
            if (this.onUpdate)
                await this.onUpdate(profile, { write, ctx });
            // If there is no atomic write provided
            if (!options.write) {
                return write.commit();
            }
        }
    }
    /** Manage the creation of the user into Firestore */
    async create(cred, options) {
        const user = cred.user;
        if (!user) {
            throw new Error('Could not create an account');
        }
        const { write = writeBatch(this.db), ctx, collection } = options;
        if (this.onSignup)
            await this.onSignup(cred, { write, ctx, collection });
        const ref = this.getRef({ user, collection });
        if (ref) {
            const profile = await this.createProfile(user, ctx);
            write.set(ref, this.toFirestore(profile, 'add'));
            if (this.onCreate)
                await this.onCreate(profile, { write, ctx, collection });
            if (!options.write) {
                await write.commit();
            }
        }
        return cred;
    }
}
BaseFireAuth.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: BaseFireAuth, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
BaseFireAuth.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: BaseFireAuth, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: BaseFireAuth, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
export class FireAuth extends BaseFireAuth {
    /**
     * Create a user based on email and password
     * Will send a verification email to the user if verificationURL is provided config
     */
    async signup(email, password, options = {}) {
        const cred = await createUserWithEmailAndPassword(this.auth, email, password);
        if (this.verificationUrl) {
            const url = this.verificationUrl;
            await sendEmailVerification(cred.user, { url });
        }
        return this.create(cred, options);
    }
    async signin(provider, passwordOrOptions, options) {
        try {
            let cred;
            if (!provider) {
                cred = await signInAnonymously(this.auth);
            }
            else if (passwordOrOptions &&
                typeof provider === 'string' &&
                typeof passwordOrOptions === 'string') {
                cred = await signInWithEmailAndPassword(this.auth, provider, passwordOrOptions);
            }
            else if (typeof provider === 'object') {
                cred = await signInWithPopup(this.auth, provider);
            }
            else {
                cred = await signInWithCustomToken(this.auth, provider);
            }
            if (!cred.user) {
                throw new Error('Could not find credential for signin');
            }
            // Signup: doesn't trigger onSignin
            if (getAdditionalUserInfo(cred)?.isNewUser) {
                options = typeof passwordOrOptions === 'object' ? passwordOrOptions : {};
                return this.create(cred, options);
            }
            if (this.onSignin)
                await this.onSignin(cred);
            return cred;
        }
        catch (err) {
            if (err.code === 'auth/operation-not-allowed') {
                console.warn('You tried to connect with a disabled auth provider. Enable it in Firebase console');
            }
            throw err;
        }
    }
    /** Signs out the current user and clear the store */
    async signout() {
        await signOut(this.auth);
        if (this.onSignout)
            await this.onSignout();
    }
}
FireAuth.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: FireAuth, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
FireAuth.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: FireAuth, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: FireAuth, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2xpYnMvbmdmaXJlL2F1dGgvc3JjL2F1dGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzdFLE9BQU8sRUFBa0IsOEJBQThCLEVBQUUsMEJBQTBCLEVBQUUscUJBQXFCLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxxQkFBcUIsRUFBc0IscUJBQXFCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFalAsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNuQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUM5RCxPQUFPLEVBQUUsY0FBYyxFQUFFLHNCQUFzQixFQUE2QyxNQUFNLGFBQWEsQ0FBQztBQUNoSCxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDckUsT0FBTyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQWMsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzVELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7O0FBRXJDLE1BQU0sS0FBSyxHQUFHLENBQUksQ0FBWSxFQUFVLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxTQUFTLENBQUM7QUFTekU7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxL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QUFDOztzR0F0RW1CLFFBQVE7MEdBQVIsUUFBUSxjQURKLE1BQU07NEZBQ1YsUUFBUTtrQkFEN0IsVUFBVTttQkFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpbmplY3QsIEluamVjdGFibGUsIEluamVjdG9yLCBOZ1pvbmUsIFBMQVRGT1JNX0lEIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IGlzUGxhdGZvcm1TZXJ2ZXIgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uXCI7XG5pbXBvcnQgeyBkb2MsIGdldERvYywgd3JpdGVCYXRjaCwgcnVuVHJhbnNhY3Rpb24gfSBmcm9tIFwiZmlyZWJhc2UvZmlyZXN0b3JlXCI7XG5pbXBvcnQgeyBVc2VyQ3JlZGVudGlhbCwgY3JlYXRlVXNlcldpdGhFbWFpbEFuZFBhc3N3b3JkLCBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCwgc2VuZEVtYWlsVmVyaWZpY2F0aW9uLCBzaWduT3V0LCBzaWduSW5Bbm9ueW1vdXNseSwgc2lnbkluV2l0aFBvcHVwLCBzaWduSW5XaXRoQ3VzdG9tVG9rZW4sIEF1dGhQcm92aWRlciwgVXNlciwgZ2V0QWRkaXRpb25hbFVzZXJJbmZvIH0gZnJvbSBcImZpcmViYXNlL2F1dGhcIjtcbmltcG9ydCB0eXBlIHsgV3JpdGVCYXRjaCwgRG9jdW1lbnRTbmFwc2hvdCwgRG9jdW1lbnRSZWZlcmVuY2UsIFVwZGF0ZURhdGEgfSBmcm9tICdmaXJlYmFzZS9maXJlc3RvcmUnO1xuaW1wb3J0IHsgdXNlciB9IGZyb20gJy4vb3BlcmF0b3JzJztcbmltcG9ydCB7IGZyb21SZWYsIHRvRGF0ZSwgRklSRVNUT1JFIH0gZnJvbSAnbmdmaXJlL2ZpcmVzdG9yZSc7XG5pbXBvcnQgeyBzaGFyZVdpdGhEZWxheSwga2VlcFVuc3RhYmxlVW50aWxGaXJzdCwgQXRvbWljV3JpdGUsIE1ldGFEb2N1bWVudCwgVXBkYXRlQ2FsbGJhY2sgfSBmcm9tICduZ2ZpcmUvY29yZSc7XG5pbXBvcnQgeyBmaWx0ZXIsIG1hcCwgc3dpdGNoTWFwLCBzaGFyZVJlcGxheSB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xuaW1wb3J0IHsgZmlyc3RWYWx1ZUZyb20sIGZyb20sIE9ic2VydmFibGUsIG9mIH0gZnJvbSBcInJ4anNcIjtcbmltcG9ydCB7IEZJUkVfQVVUSCB9IGZyb20gXCIuL3Rva2Vuc1wiO1xuXG5jb25zdCBleGlzdCA9IDxUPih2PzogVCB8IG51bGwpOiB2IGlzIFQgPT4gdiAhPT0gbnVsbCAmJiB2ICE9PSB1bmRlZmluZWQ7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXV0aFdyaXRlT3B0aW9uczxDdHggPSBhbnk+IHtcbiAgd3JpdGU/OiBBdG9taWNXcml0ZTtcbiAgY3R4PzogQ3R4O1xuICBjb2xsZWN0aW9uPzogbnVsbCB8IHN0cmluZztcbn1cblxuXG4vKipcbiAqIEdldCB0aGUgY3VzdG9tIGNsYWltcyBvZiBhIHVzZXIuIElmIG5vIGtleSBpcyBwcm92aWRlZCwgcmV0dXJuIHRoZSB3aG9sZSBjbGFpbXMgb2JqZWN0XG4gKiBAcGFyYW0gdXNlciBUaGUgdXNlciBvYmplY3QgcmV0dXJuZWQgYnkgRmlyZWJhc2UgQXV0aFxuICogQHBhcmFtIHJvbGVzIEtleXMgb2YgdGhlIGN1c3RvbSBjbGFpbXMgaW5zaWRlIHRoZSBjbGFpbSBvYmpldFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q3VzdG9tQ2xhaW1zPENsYWltcyBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4+KFxuICB1c2VyOiBVc2VyLFxuICBrZXlzPzogc3RyaW5nIHwgc3RyaW5nW11cbik6IFByb21pc2U8Q2xhaW1zPiB7XG4gIGlmICghdXNlcikgcmV0dXJuIHt9IGFzIENsYWltcztcbiAgY29uc3QgeyBjbGFpbXMgfSA9IGF3YWl0IHVzZXIuZ2V0SWRUb2tlblJlc3VsdCgpO1xuICBpZiAoIWtleXMpIHJldHVybiBjbGFpbXMgYXMgQ2xhaW1zO1xuXG4gIGNvbnN0IGZpZWxkcyA9IEFycmF5LmlzQXJyYXkoa2V5cykgPyBrZXlzIDogW2tleXNdO1xuICBjb25zdCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcbiAgZm9yIChjb25zdCBrZXkgb2YgZmllbGRzKSB7XG4gICAgaWYgKGNsYWltc1trZXldKSB7XG4gICAgICByZXN1bHRba2V5XSA9IGNsYWltc1trZXldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0IGFzIENsYWltcztcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gaXNVcGRhdGVDYWxsYmFjazxUPihcbiAgdXBkYXRlOiBVcGRhdGVDYWxsYmFjazxUPiB8IFBhcnRpYWw8VD5cbik6IHVwZGF0ZSBpcyBVcGRhdGVDYWxsYmFjazxUPiB7XG4gIHJldHVybiB0eXBlb2YgdXBkYXRlID09PSAnZnVuY3Rpb24nO1xufVxuXG5cblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlRmlyZUF1dGg8UHJvZmlsZSwgUm9sZXMgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCBhbnk+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkPiB7XG4gIHByaXZhdGUgbWVtb1Byb2ZpbGU6IFJlY29yZDxzdHJpbmcsIE9ic2VydmFibGU8RG9jdW1lbnRTbmFwc2hvdDxQcm9maWxlPj4+ID0ge307XG4gIHByaXZhdGUgcGxhdGZvcm1JZCA9IGluamVjdChQTEFURk9STV9JRCk7XG4gIHByb3RlY3RlZCBnZXRBdXRoID0gaW5qZWN0KEZJUkVfQVVUSCk7XG4gIHByb3RlY3RlZCBpbmplY3RvciA9IGluamVjdChJbmplY3Rvcik7XG4gIHByaXZhdGUgem9uZSA9IGluamVjdChOZ1pvbmUpO1xuICBcbiAgcHJvdGVjdGVkIGFic3RyYWN0IHBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgcHJvdGVjdGVkIGlkS2V5ID0gJ2lkJztcbiAgcHJvdGVjdGVkIHZlcmlmaWNhdGlvblVybD86IHN0cmluZztcbiAgXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBzaWduaW4oLi4uYXJnOiBhbnlbXSk6IFByb21pc2U8VXNlckNyZWRlbnRpYWw+O1xuICBwcm90ZWN0ZWQgYWJzdHJhY3Qgc2lnbm91dCgpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIHByb3RlY3RlZCBnZXQgZGIoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5qZWN0b3IuZ2V0KEZJUkVTVE9SRSk7XG4gIH1cbiAgXG4gIGdldCBhdXRoKCkge1xuICAgIHJldHVybiB0aGlzLmluamVjdG9yLmdldChGSVJFX0FVVEgpO1xuICB9XG5cbiAgZ2V0IHVzZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXV0aC5jdXJyZW50VXNlcjtcbiAgfVxuXG4gIHVzZXIkID0gaXNQbGF0Zm9ybVNlcnZlcih0aGlzLnBsYXRmb3JtSWQpXG4gICAgPyB0aGlzLnpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4gdXNlcih0aGlzLmF1dGgpKVxuICAgIDogdXNlcih0aGlzLmF1dGgpLnBpcGUoc2hhcmVSZXBsYXkoeyByZWZDb3VudDogdHJ1ZSwgYnVmZmVyU2l6ZTogMSB9KSk7XG4gIFxuICAvKipcbiAgICogT2JzZXJ2ZSBjdXJyZW50IHVzZXIuIERvZXNuJ3QgZW1pdCBpZiB0aGVyZSBhcmUgbm8gdXNlciBjb25uZWN0ZWQuXG4gICAqIFVzZSBgdXNlcmAgaWYgeW91IG5lZWQgdG8ga25vdyBpZiB1c2VyIGlzIGNvbm5lY3RlZFxuICAgKi9cbiAgY3VycmVudFVzZXIkID0gdGhpcy51c2VyJC5waXBlKGZpbHRlcihleGlzdCkpO1xuXG4gIC8qKiBMaXN0ZW4gb24gY2hhbmdlcyBmcm9tIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIgKi9cbiAgcHJvZmlsZSQgPSB0aGlzLnVzZXIkLnBpcGUoXG4gICAgbWFwKCh1c2VyKSA9PiB0aGlzLmdldFJlZih7IHVzZXIgfSkpLFxuICAgIHN3aXRjaE1hcCgocmVmKSA9PiAocmVmID8gdGhpcy51c2VNZW1vKHJlZikgOiBvZih1bmRlZmluZWQpKSksXG4gICAgbWFwKHNuYXBzaG90ID0+IHNuYXBzaG90ID8gdGhpcy5mcm9tRmlyZXN0b3JlKHNuYXBzaG90KSA6IHVuZGVmaW5lZCksXG4gICk7XG5cbiAgLyoqIFRyaWdnZXJlZCB3aGVuIHRoZSBwcm9maWxlIGhhcyBiZWVuIGNyZWF0ZWQgKi9cbiAgcHJvdGVjdGVkIG9uQ3JlYXRlPyhwcm9maWxlOiBQYXJ0aWFsPFByb2ZpbGU+LCBvcHRpb25zOiBBdXRoV3JpdGVPcHRpb25zKTogdW5rbm93bjtcbiAgLyoqIFRyaWdnZXJlZCB3aGVuIHRoZSBwcm9maWxlIGhhcyBiZWVuIHVwZGF0ZWQgKi9cbiAgcHJvdGVjdGVkIG9uVXBkYXRlPyhwcm9maWxlOiBQYXJ0aWFsPFByb2ZpbGU+LCBvcHRpb25zOiBBdXRoV3JpdGVPcHRpb25zKTogdW5rbm93bjtcbiAgLyoqIFRyaWdnZXJlZCB3aGVuIHRoZSBwcm9maWxlIGhhcyBiZWVuIGRlbGV0ZWQgKi9cbiAgcHJvdGVjdGVkIG9uRGVsZXRlPyhvcHRpb25zOiBBdXRoV3JpdGVPcHRpb25zKTogdW5rbm93bjtcbiAgLyoqIFRyaWdnZXJlZCB3aGVuIHVzZXIgc2lnbmluIGZvciB0aGUgZmlyc3QgdGltZSBvciBzaWdudXAgd2l0aCBlbWFpbCAmIHBhc3N3b3JkICovXG4gIHByb3RlY3RlZCBvblNpZ251cD8oY3JlZGVudGlhbDogVXNlckNyZWRlbnRpYWwsIG9wdGlvbnM6IEF1dGhXcml0ZU9wdGlvbnMpOiB1bmtub3duO1xuICAvKiogVHJpZ2dlcmVkIHdoZW4gYSB1c2VyIHNpZ25pbiwgZXhjZXB0IGZvciB0aGUgZmlyc3QgdGltZSBAc2VlIG9uU2lnbnVwICovXG4gIHByb3RlY3RlZCBvblNpZ25pbj8oY3JlZGVudGlhbDogVXNlckNyZWRlbnRpYWwpOiB1bmtub3duO1xuICAvKiogVHJpZ2dlcmVkIHdoZW4gYSB1c2VyIHNpZ25vdXQgKi9cbiAgcHJvdGVjdGVkIG9uU2lnbm91dD8oKTogdW5rbm93bjtcblxuICBwcm90ZWN0ZWQgdXNlTWVtbyhyZWY6IERvY3VtZW50UmVmZXJlbmNlPFByb2ZpbGU+KSB7XG4gICAgaWYgKGlzUGxhdGZvcm1TZXJ2ZXIodGhpcy5wbGF0Zm9ybUlkKSkge1xuICAgICAgcmV0dXJuIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiBmcm9tKGdldERvYyhyZWYpKSkucGlwZShrZWVwVW5zdGFibGVVbnRpbEZpcnN0KHRoaXMuem9uZSkpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMubWVtb1Byb2ZpbGVbcmVmLnBhdGhdKSB7XG4gICAgICB0aGlzLm1lbW9Qcm9maWxlW3JlZi5wYXRoXSA9IGZyb21SZWYocmVmKS5waXBlKFxuICAgICAgICBzaGFyZVdpdGhEZWxheSgxMDApLFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubWVtb1Byb2ZpbGVbcmVmLnBhdGhdO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdCB0aGUgcm9sZXMgZm9yIHRoaXMgdXNlci4gQ2FuIGJlIGluIGN1c3RvbSBjbGFpbXMgb3IgaW4gYSBGaXJlc3RvcmUgY29sbGVjdGlvblxuICAgKiBAcGFyYW0gdXNlciBUaGUgdXNlciBnaXZlbiBieSBGaXJlQXV0aFxuICAgKiBAc2VlIGdldEN1c3RvbUNsYWltcyB0byBnZXQgdGhlIGN1c3RvbSBjbGFpbXMgb3V0IG9mIHRoZSB1c2VyXG4gICAqIEBub3RlIENhbiBiZSBvdmVyd3JpdHRlblxuICAgKi9cbiAgcHJvdGVjdGVkIHNlbGVjdFJvbGVzKHVzZXI6IFVzZXIpOiBQcm9taXNlPFJvbGVzPiB8IE9ic2VydmFibGU8Um9sZXM+IHtcbiAgICByZXR1cm4gZ2V0Q3VzdG9tQ2xhaW1zPFJvbGVzIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55PiA/IFJvbGVzIDogYW55Pih1c2VyKSBhcyBQcm9taXNlPFJvbGVzPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0cmlnZ2VyZWQgd2hlbiBnZXR0aW5nIGRhdGEgZnJvbSBmaXJlc3RvcmVcbiAgICogQG5vdGUgc2hvdWxkIGJlIG92ZXJ3cml0dGVuXG4gICAqL1xuICBwcm90ZWN0ZWQgZnJvbUZpcmVzdG9yZShzbmFwc2hvdDogRG9jdW1lbnRTbmFwc2hvdDxQcm9maWxlPikge1xuICAgIHJldHVybiBzbmFwc2hvdC5leGlzdHMoKVxuICAgICAgPyAoeyAuLi50b0RhdGUoc25hcHNob3QuZGF0YSgpKSwgW3RoaXMuaWRLZXldOiBzbmFwc2hvdC5pZCB9IGFzIFByb2ZpbGUpXG4gICAgICA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0cmlnZ2VyZWQgd2hlbiBhZGRpbmcvdXBkYXRpbmcgZGF0YSB0byBmaXJlc3RvcmVcbiAgICogQG5vdGUgc2hvdWxkIGJlIG92ZXJ3cml0dGVuXG4gICAqL1xuICBwcm90ZWN0ZWQgdG9GaXJlc3RvcmUocHJvZmlsZTogUGFydGlhbDxQcm9maWxlPiwgYWN0aW9uVHlwZTogJ2FkZCcgfCAndXBkYXRlJyk6IGFueSB7XG4gICAgaWYgKGFjdGlvblR5cGUgPT09ICdhZGQnKSB7XG4gICAgICBjb25zdCBfbWV0YTogTWV0YURvY3VtZW50ID0geyBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksIG1vZGlmaWVkQXQ6IG5ldyBEYXRlKCkgfTtcbiAgICAgIHJldHVybiB7IF9tZXRhLCAuLi5wcm9maWxlIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7IC4uLnByb2ZpbGUsICdfbWV0YS5tb2RpZmllZEF0JzogbmV3IERhdGUoKSB9O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0cmlnZ2VyZWQgd2hlbiB0cmFuc2Zvcm1pbmcgYSB1c2VyIGludG8gYSBwcm9maWxlXG4gICAqIEBwYXJhbSB1c2VyIFRoZSB1c2VyIG9iamVjdCBmcm9tIEZpcmVBdXRoXG4gICAqIEBwYXJhbSBjdHggVGhlIGNvbnRleHQgZ2l2ZW4gb24gc2lnbnVwXG4gICAqL1xuICBwcm90ZWN0ZWQgY3JlYXRlUHJvZmlsZSh1c2VyOiBVc2VyLCBjdHg/OiBhbnkpOiBQcm9taXNlPFBhcnRpYWw8UHJvZmlsZT4+IHwgUGFydGlhbDxQcm9maWxlPiB7XG4gICAgcmV0dXJuIHsgYXZhdGFyOiB1c2VyPy5waG90b1VSTCwgZGlzcGxheU5hbWU6IHVzZXI/LmRpc3BsYXlOYW1lIH0gYXMgYW55O1xuICB9XG5cbiAgLyoqIFRyaWdnZXJkIHdoZW4gY3JlYXRpbmcgb3IgZ2V0dGluZyBhIHVzZXIgKi9cbiAgcHJvdGVjdGVkIHVzZUNvbGxlY3Rpb24odXNlcjogVXNlcik6IHVuZGVmaW5lZCB8IG51bGwgfCBzdHJpbmcgfCBQcm9taXNlPHVuZGVmaW5lZCB8IG51bGwgfCBzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5wYXRoID8/IG51bGw7XG4gIH1cblxuICAvKiogSWYgdXNlciBjb25uZWN0ZWQsIHJldHVybiBpdHMgZG9jdW1lbnQgaW4gRmlyZXN0b3JlLCAgKi9cbiAgcHJvdGVjdGVkIGdldFJlZihvcHRpb25zOiB7IHVzZXI/OiBVc2VyIHwgbnVsbDsgY29sbGVjdGlvbj86IHN0cmluZyB8IG51bGwgfSA9IHt9KSB7XG4gICAgY29uc3QgdXNlciA9IG9wdGlvbnMudXNlciA/PyB0aGlzLnVzZXI7XG4gICAgaWYgKHVzZXIpIHtcbiAgICAgIHJldHVybiBkb2ModGhpcy5kYiwgYCR7dGhpcy5wYXRofS8ke3VzZXIudWlkfWApIGFzIERvY3VtZW50UmVmZXJlbmNlPFByb2ZpbGU+XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKiBSZXR1cm4gY3VycmVudCB1c2VyLiBPbmx5IHJldHVybiB3aGVuIGF1dGggaGFzIGVtaXQgKi9cbiAgYXdhaXRVc2VyKCkge1xuICAgIHJldHVybiBmaXJzdFZhbHVlRnJvbSh0aGlzLnVzZXIkKTtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIGN1cnJlbnQgdXNlciBQcm9maWxlIGZyb20gRmlyZXN0b3JlICovXG4gIGFzeW5jIGdldFZhbHVlKCkge1xuICAgIGNvbnN0IHJlZiA9IHRoaXMuZ2V0UmVmKCk7XG4gICAgaWYgKHJlZikge1xuICAgICAgY29uc3Qgc25hcHNob3QgPSBhd2FpdCBnZXREb2MocmVmKTtcbiAgICAgIHJldHVybiB0aGlzLmZyb21GaXJlc3RvcmUoc25hcHNob3QpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIERlbGV0ZSB1c2VyIGZyb20gYXV0aGVudGljYXRpb24gc2VydmljZSBhbmQgZGF0YWJhc2VcbiAgICogV0FSTklORyBUaGlzIGlzIHNlY3VyaXR5IHNlbnNpdGl2ZSBvcGVyYXRpb25cbiAgICovXG4gIGFzeW5jIGRlbGV0ZShvcHRpb25zOiBBdXRoV3JpdGVPcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB1c2VyID0gdGhpcy51c2VyO1xuICAgIGNvbnN0IHJlZiA9IHRoaXMuZ2V0UmVmKHsgdXNlciB9KTtcbiAgICBpZiAoIXVzZXIgfHwgIXJlZikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyB1c2VyIGNvbm5lY3RlZCcpO1xuICAgIH1cbiAgICBjb25zdCB7IHdyaXRlID0gd3JpdGVCYXRjaCh0aGlzLmRiKSwgY3R4IH0gPSBvcHRpb25zO1xuICAgIHdyaXRlLmRlbGV0ZShyZWYpO1xuICAgIGlmICh0aGlzLm9uRGVsZXRlKSBhd2FpdCB0aGlzLm9uRGVsZXRlKHsgd3JpdGUsIGN0eCB9KTtcbiAgICBpZiAoIW9wdGlvbnMud3JpdGUpIHtcbiAgICAgIGF3YWl0ICh3cml0ZSBhcyBXcml0ZUJhdGNoKS5jb21taXQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHVzZXIuZGVsZXRlKCk7XG4gIH1cblxuICAvKiogVXBkYXRlIHRoZSBjdXJyZW50IHByb2ZpbGUgb2YgdGhlIGF1dGhlbnRpY2F0ZWQgdXNlciAqL1xuICBhc3luYyB1cGRhdGUoXG4gICAgcHJvZmlsZTogUGFydGlhbDxQcm9maWxlPiB8IFVwZGF0ZUNhbGxiYWNrPFByb2ZpbGU+LFxuICAgIG9wdGlvbnM6IEF1dGhXcml0ZU9wdGlvbnMgPSB7fVxuICApIHtcbiAgICBjb25zdCByZWYgPSB0aGlzLmdldFJlZigpO1xuICAgIGlmICghcmVmKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHVzZXIgY29ubmVjdGVkLicpO1xuICAgIH1cbiAgICBpZiAoaXNVcGRhdGVDYWxsYmFjayhwcm9maWxlKSkge1xuICAgICAgcmV0dXJuIHJ1blRyYW5zYWN0aW9uKHRoaXMuZGIsIGFzeW5jICh0eCkgPT4ge1xuICAgICAgICBjb25zdCBzbmFwc2hvdCA9IChhd2FpdCB0eC5nZXQocmVmKSkgYXMgRG9jdW1lbnRTbmFwc2hvdDxQcm9maWxlPjtcbiAgICAgICAgY29uc3QgZG9jID0gdGhpcy5mcm9tRmlyZXN0b3JlKHNuYXBzaG90KTtcbiAgICAgICAgaWYgKCFkb2MpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGRvY3VtZW50IGF0IFwiJHt0aGlzLnBhdGh9LyR7c25hcHNob3QuaWR9XCJgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcHJvZmlsZSh0aGlzLnRvRmlyZXN0b3JlKGRvYywgJ3VwZGF0ZScpLCB0eCk7XG4gICAgICAgIHR4LnVwZGF0ZShyZWYsIGRhdGEgYXMgVXBkYXRlRGF0YTxQcm9maWxlPik7XG4gICAgICAgIGlmICh0aGlzLm9uVXBkYXRlKSBhd2FpdCB0aGlzLm9uVXBkYXRlKGRhdGEsIHsgd3JpdGU6IHR4LCBjdHg6IG9wdGlvbnMuY3R4IH0pO1xuICAgICAgICByZXR1cm4gdHg7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9maWxlID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3QgeyB3cml0ZSA9IHdyaXRlQmF0Y2godGhpcy5kYiksIGN0eCB9ID0gb3B0aW9ucztcbiAgICAgICh3cml0ZSBhcyBXcml0ZUJhdGNoKS51cGRhdGUocmVmLCB0aGlzLnRvRmlyZXN0b3JlKHByb2ZpbGUsICd1cGRhdGUnKSk7XG4gICAgICBpZiAodGhpcy5vblVwZGF0ZSkgYXdhaXQgdGhpcy5vblVwZGF0ZShwcm9maWxlLCB7IHdyaXRlLCBjdHggfSk7XG4gICAgICAvLyBJZiB0aGVyZSBpcyBubyBhdG9taWMgd3JpdGUgcHJvdmlkZWRcbiAgICAgIGlmICghb3B0aW9ucy53cml0ZSkge1xuICAgICAgICByZXR1cm4gKHdyaXRlIGFzIFdyaXRlQmF0Y2gpLmNvbW1pdCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBNYW5hZ2UgdGhlIGNyZWF0aW9uIG9mIHRoZSB1c2VyIGludG8gRmlyZXN0b3JlICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGUoY3JlZDogVXNlckNyZWRlbnRpYWwsIG9wdGlvbnM6IEF1dGhXcml0ZU9wdGlvbnMpIHtcbiAgICBjb25zdCB1c2VyID0gY3JlZC51c2VyO1xuICAgIGlmICghdXNlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgY3JlYXRlIGFuIGFjY291bnQnKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IHdyaXRlID0gd3JpdGVCYXRjaCh0aGlzLmRiKSwgY3R4LCBjb2xsZWN0aW9uIH0gPSBvcHRpb25zO1xuICAgIGlmICh0aGlzLm9uU2lnbnVwKSBhd2FpdCB0aGlzLm9uU2lnbnVwKGNyZWQsIHsgd3JpdGUsIGN0eCwgY29sbGVjdGlvbiB9KTtcblxuICAgIGNvbnN0IHJlZiA9IHRoaXMuZ2V0UmVmKHsgdXNlciwgY29sbGVjdGlvbiB9KTtcbiAgICBpZiAocmVmKSB7XG4gICAgICBjb25zdCBwcm9maWxlID0gYXdhaXQgdGhpcy5jcmVhdGVQcm9maWxlKHVzZXIsIGN0eCk7XG4gICAgICAod3JpdGUgYXMgV3JpdGVCYXRjaCkuc2V0KHJlZiwgdGhpcy50b0ZpcmVzdG9yZShwcm9maWxlLCAnYWRkJykpO1xuICAgICAgaWYgKHRoaXMub25DcmVhdGUpIGF3YWl0IHRoaXMub25DcmVhdGUocHJvZmlsZSwgeyB3cml0ZSwgY3R4LCBjb2xsZWN0aW9uIH0pO1xuICAgICAgaWYgKCFvcHRpb25zLndyaXRlKSB7XG4gICAgICAgIGF3YWl0ICh3cml0ZSBhcyBXcml0ZUJhdGNoKS5jb21taXQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNyZWQ7XG4gIH1cbn1cblxuXG5cblxuXG5cblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBGaXJlQXV0aDxQcm9maWxlLCBSb2xlcyBleHRlbmRzIFJlY29yZDxzdHJpbmcsIGFueT4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ+IGV4dGVuZHMgQmFzZUZpcmVBdXRoPFByb2ZpbGUsIFJvbGVzPiB7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBwYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIHVzZXIgYmFzZWQgb24gZW1haWwgYW5kIHBhc3N3b3JkXG4gICAqIFdpbGwgc2VuZCBhIHZlcmlmaWNhdGlvbiBlbWFpbCB0byB0aGUgdXNlciBpZiB2ZXJpZmljYXRpb25VUkwgaXMgcHJvdmlkZWQgY29uZmlnXG4gICAqL1xuICBhc3luYyBzaWdudXAoXG4gICAgZW1haWw6IHN0cmluZyxcbiAgICBwYXNzd29yZDogc3RyaW5nLFxuICAgIG9wdGlvbnM6IEF1dGhXcml0ZU9wdGlvbnMgPSB7fVxuICApOiBQcm9taXNlPFVzZXJDcmVkZW50aWFsPiB7XG4gICAgY29uc3QgY3JlZCA9IGF3YWl0IGNyZWF0ZVVzZXJXaXRoRW1haWxBbmRQYXNzd29yZCh0aGlzLmF1dGgsIGVtYWlsLCBwYXNzd29yZCk7XG4gICAgaWYgKHRoaXMudmVyaWZpY2F0aW9uVXJsKSB7XG4gICAgICBjb25zdCB1cmwgPSB0aGlzLnZlcmlmaWNhdGlvblVybDtcbiAgICAgIGF3YWl0IHNlbmRFbWFpbFZlcmlmaWNhdGlvbihjcmVkLnVzZXIsIHsgdXJsIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jcmVhdGUoY3JlZCwgb3B0aW9ucyk7XG4gIH1cblxuICAvKiogU2lnbmluIHdpdGggZW1haWwgJiBwYXNzd29yZCwgcHJvdmlkZXIgbmFtZSwgcHJvdmlkZXIgb2JqZXQgb3IgY3VzdG9tIHRva2VuICovXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogdW5pZmllZC1zaWduYXR1cmVzXG4gIHNpZ25pbihlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBvcHRpb25zPzogQXV0aFdyaXRlT3B0aW9ucyk6IFByb21pc2U8VXNlckNyZWRlbnRpYWw+O1xuICBzaWduaW4oYXV0aFByb3ZpZGVyOiBBdXRoUHJvdmlkZXIsIG9wdGlvbnM/OiBBdXRoV3JpdGVPcHRpb25zKTogUHJvbWlzZTxVc2VyQ3JlZGVudGlhbD47XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogdW5pZmllZC1zaWduYXR1cmVzXG4gIHNpZ25pbih0b2tlbjogc3RyaW5nLCBvcHRpb25zPzogQXV0aFdyaXRlT3B0aW9ucyk6IFByb21pc2U8VXNlckNyZWRlbnRpYWw+O1xuICBhc3luYyBzaWduaW4oXG4gICAgcHJvdmlkZXI/OiBBdXRoUHJvdmlkZXIgfCBzdHJpbmcsXG4gICAgcGFzc3dvcmRPck9wdGlvbnM/OiBzdHJpbmcgfCBBdXRoV3JpdGVPcHRpb25zLFxuICAgIG9wdGlvbnM/OiBBdXRoV3JpdGVPcHRpb25zXG4gICk6IFByb21pc2U8VXNlckNyZWRlbnRpYWw+IHtcbiAgICB0cnkge1xuICAgICAgbGV0IGNyZWQ6IFVzZXJDcmVkZW50aWFsO1xuICAgICAgaWYgKCFwcm92aWRlcikge1xuICAgICAgICBjcmVkID0gYXdhaXQgc2lnbkluQW5vbnltb3VzbHkodGhpcy5hdXRoKTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHBhc3N3b3JkT3JPcHRpb25zICYmXG4gICAgICAgIHR5cGVvZiBwcm92aWRlciA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgdHlwZW9mIHBhc3N3b3JkT3JPcHRpb25zID09PSAnc3RyaW5nJ1xuICAgICAgKSB7XG4gICAgICAgIGNyZWQgPSBhd2FpdCBzaWduSW5XaXRoRW1haWxBbmRQYXNzd29yZCh0aGlzLmF1dGgsIHByb3ZpZGVyLCBwYXNzd29yZE9yT3B0aW9ucyk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwcm92aWRlciA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgY3JlZCA9IGF3YWl0IHNpZ25JbldpdGhQb3B1cCh0aGlzLmF1dGgsIHByb3ZpZGVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNyZWQgPSBhd2FpdCBzaWduSW5XaXRoQ3VzdG9tVG9rZW4odGhpcy5hdXRoLCBwcm92aWRlcik7XG4gICAgICB9XG4gICAgICBpZiAoIWNyZWQudXNlcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIGNyZWRlbnRpYWwgZm9yIHNpZ25pbicpO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBTaWdudXA6IGRvZXNuJ3QgdHJpZ2dlciBvblNpZ25pblxuICAgICAgaWYgKGdldEFkZGl0aW9uYWxVc2VySW5mbyhjcmVkKT8uaXNOZXdVc2VyKSB7XG4gICAgICAgIG9wdGlvbnMgPSB0eXBlb2YgcGFzc3dvcmRPck9wdGlvbnMgPT09ICdvYmplY3QnID8gcGFzc3dvcmRPck9wdGlvbnMgOiB7fTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlKGNyZWQsIG9wdGlvbnMpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vblNpZ25pbikgYXdhaXQgdGhpcy5vblNpZ25pbihjcmVkKTtcbiAgICAgIHJldHVybiBjcmVkO1xuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICBpZiAoZXJyLmNvZGUgPT09ICdhdXRoL29wZXJhdGlvbi1ub3QtYWxsb3dlZCcpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdZb3UgdHJpZWQgdG8gY29ubmVjdCB3aXRoIGEgZGlzYWJsZWQgYXV0aCBwcm92aWRlci4gRW5hYmxlIGl0IGluIEZpcmViYXNlIGNvbnNvbGUnKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cblxuICAvKiogU2lnbnMgb3V0IHRoZSBjdXJyZW50IHVzZXIgYW5kIGNsZWFyIHRoZSBzdG9yZSAqL1xuICBhc3luYyBzaWdub3V0KCkge1xuICAgIGF3YWl0IHNpZ25PdXQodGhpcy5hdXRoKTtcbiAgICBpZiAodGhpcy5vblNpZ25vdXQpIGF3YWl0IHRoaXMub25TaWdub3V0KCk7XG4gIH1cbn0iXX0=