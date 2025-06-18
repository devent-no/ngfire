import { __awaiter } from 'tslib';
import * as i0 from '@angular/core';
import { InjectionToken, inject, InjectFlags, PLATFORM_ID, Injector, NgZone, Injectable } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { getDoc, doc, writeBatch, runTransaction } from 'firebase/firestore';
import { onIdTokenChanged, initializeAuth, getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInAnonymously, signInWithEmailAndPassword, signInWithPopup, signInWithCustomToken, getAdditionalUserInfo, signOut } from 'firebase/auth';
import { Observable, of, from, firstValueFrom } from 'rxjs';
import { FIRESTORE, fromRef, toDate } from 'ngfire/firestore';
import { keepUnstableUntilFirst, shareWithDelay } from 'ngfire/core';
import { shareReplay, filter, map, switchMap } from 'rxjs/operators';
import { FIREBASE_APP } from 'ngfire/app';
import { getConfig, AUTH_DEPS } from 'ngfire/tokens';

function user(auth) {
    return new Observable(subscriber => {
        const unsubscribe = onIdTokenChanged(auth, subscriber.next.bind(subscriber), subscriber.error.bind(subscriber), subscriber.complete.bind(subscriber));
        return { unsubscribe };
    });
}

const FIRE_AUTH = new InjectionToken('Fire auth instance', {
    providedIn: 'root',
    factory: () => {
        const config = getConfig();
        const app = inject(FIREBASE_APP);
        const deps = inject(AUTH_DEPS, InjectFlags.Optional) || undefined;
        if (config.auth) {
            return config.auth(app, deps);
        }
        else {
            return deps ? initializeAuth(app, deps) : getAuth(app);
        }
    },
});

const exist = (v) => v !== null && v !== undefined;
/**
 * Get the custom claims of a user. If no key is provided, return the whole claims object
 * @param user The user object returned by Firebase Auth
 * @param roles Keys of the custom claims inside the claim objet
 */
function getCustomClaims(user, keys) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!user)
            return {};
        const { claims } = yield user.getIdTokenResult();
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
    });
}
function isUpdateCallback(update) {
    return typeof update === 'function';
}
class BaseFireAuth {
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
            ? Object.assign(Object.assign({}, toDate(snapshot.data())), { [this.idKey]: snapshot.id }) : undefined;
    }
    /**
     * Function triggered when adding/updating data to firestore
     * @note should be overwritten
     */
    toFirestore(profile, actionType) {
        if (actionType === 'add') {
            const _meta = { createdAt: new Date(), modifiedAt: new Date() };
            return Object.assign({ _meta }, profile);
        }
        else {
            return Object.assign(Object.assign({}, profile), { '_meta.modifiedAt': new Date() });
        }
    }
    /**
     * Function triggered when transforming a user into a profile
     * @param user The user object from FireAuth
     * @param ctx The context given on signup
     */
    createProfile(user, ctx) {
        return { avatar: user === null || user === void 0 ? void 0 : user.photoURL, displayName: user === null || user === void 0 ? void 0 : user.displayName };
    }
    /** Triggerd when creating or getting a user */
    useCollection(user) {
        var _a;
        return (_a = this.path) !== null && _a !== void 0 ? _a : null;
    }
    /** If user connected, return its document in Firestore,  */
    getRef(options = {}) {
        var _a;
        const user = (_a = options.user) !== null && _a !== void 0 ? _a : this.user;
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
    getValue() {
        return __awaiter(this, void 0, void 0, function* () {
            const ref = this.getRef();
            if (ref) {
                const snapshot = yield getDoc(ref);
                return this.fromFirestore(snapshot);
            }
            return;
        });
    }
    /**
     * @description Delete user from authentication service and database
     * WARNING This is security sensitive operation
     */
    delete(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.user;
            const ref = this.getRef({ user });
            if (!user || !ref) {
                throw new Error('No user connected');
            }
            const { write = writeBatch(this.db), ctx } = options;
            write.delete(ref);
            if (this.onDelete)
                yield this.onDelete({ write, ctx });
            if (!options.write) {
                yield write.commit();
            }
            return user.delete();
        });
    }
    /** Update the current profile of the authenticated user */
    update(profile, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const ref = this.getRef();
            if (!ref) {
                throw new Error('No user connected.');
            }
            if (isUpdateCallback(profile)) {
                return runTransaction(this.db, (tx) => __awaiter(this, void 0, void 0, function* () {
                    const snapshot = (yield tx.get(ref));
                    const doc = this.fromFirestore(snapshot);
                    if (!doc) {
                        throw new Error(`Could not find document at "${this.path}/${snapshot.id}"`);
                    }
                    const data = yield profile(this.toFirestore(doc, 'update'), tx);
                    tx.update(ref, data);
                    if (this.onUpdate)
                        yield this.onUpdate(data, { write: tx, ctx: options.ctx });
                    return tx;
                }));
            }
            else if (typeof profile === 'object') {
                const { write = writeBatch(this.db), ctx } = options;
                write.update(ref, this.toFirestore(profile, 'update'));
                if (this.onUpdate)
                    yield this.onUpdate(profile, { write, ctx });
                // If there is no atomic write provided
                if (!options.write) {
                    return write.commit();
                }
            }
        });
    }
    /** Manage the creation of the user into Firestore */
    create(cred, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = cred.user;
            if (!user) {
                throw new Error('Could not create an account');
            }
            const { write = writeBatch(this.db), ctx, collection } = options;
            if (this.onSignup)
                yield this.onSignup(cred, { write, ctx, collection });
            const ref = this.getRef({ user, collection });
            if (ref) {
                const profile = yield this.createProfile(user, ctx);
                write.set(ref, this.toFirestore(profile, 'add'));
                if (this.onCreate)
                    yield this.onCreate(profile, { write, ctx, collection });
                if (!options.write) {
                    yield write.commit();
                }
            }
            return cred;
        });
    }
}
BaseFireAuth.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: BaseFireAuth, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
BaseFireAuth.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: BaseFireAuth, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: BaseFireAuth, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
class FireAuth extends BaseFireAuth {
    /**
     * Create a user based on email and password
     * Will send a verification email to the user if verificationURL is provided config
     */
    signup(email, password, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const cred = yield createUserWithEmailAndPassword(this.auth, email, password);
            if (this.verificationUrl) {
                const url = this.verificationUrl;
                yield sendEmailVerification(cred.user, { url });
            }
            return this.create(cred, options);
        });
    }
    signin(provider, passwordOrOptions, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let cred;
                if (!provider) {
                    cred = yield signInAnonymously(this.auth);
                }
                else if (passwordOrOptions &&
                    typeof provider === 'string' &&
                    typeof passwordOrOptions === 'string') {
                    cred = yield signInWithEmailAndPassword(this.auth, provider, passwordOrOptions);
                }
                else if (typeof provider === 'object') {
                    cred = yield signInWithPopup(this.auth, provider);
                }
                else {
                    cred = yield signInWithCustomToken(this.auth, provider);
                }
                if (!cred.user) {
                    throw new Error('Could not find credential for signin');
                }
                // Signup: doesn't trigger onSignin
                if ((_a = getAdditionalUserInfo(cred)) === null || _a === void 0 ? void 0 : _a.isNewUser) {
                    options = typeof passwordOrOptions === 'object' ? passwordOrOptions : {};
                    return this.create(cred, options);
                }
                if (this.onSignin)
                    yield this.onSignin(cred);
                return cred;
            }
            catch (err) {
                if (err.code === 'auth/operation-not-allowed') {
                    console.warn('You tried to connect with a disabled auth provider. Enable it in Firebase console');
                }
                throw err;
            }
        });
    }
    /** Signs out the current user and clear the store */
    signout() {
        return __awaiter(this, void 0, void 0, function* () {
            yield signOut(this.auth);
            if (this.onSignout)
                yield this.onSignout();
        });
    }
}
FireAuth.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: FireAuth, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
FireAuth.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: FireAuth, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.10", ngImport: i0, type: FireAuth, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { BaseFireAuth, FIRE_AUTH, FireAuth, getCustomClaims, isUpdateCallback };
//# sourceMappingURL=ngfire-auth.mjs.map
