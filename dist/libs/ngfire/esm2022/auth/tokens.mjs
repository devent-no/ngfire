import { inject, InjectFlags, InjectionToken } from "@angular/core";
import { getAuth, initializeAuth } from "firebase/auth";
import { FIREBASE_APP } from "ngfire/app";
import { AUTH_DEPS, getConfig } from "ngfire/tokens";
export const FIRE_AUTH = new InjectionToken('Fire auth instance', {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbGlicy9uZ2ZpcmUvYXV0aC9zcmMvdG9rZW5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNwRSxPQUFPLEVBQVEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM5RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXJELE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxJQUFJLGNBQWMsQ0FBTyxvQkFBb0IsRUFBRTtJQUN0RSxVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ1osTUFBTSxNQUFNLEdBQUcsU0FBUyxFQUFFLENBQUM7UUFDM0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFNBQVMsQ0FBQztRQUNsRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoQixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hDLENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6RCxDQUFDO0lBQ0gsQ0FBQztDQUNGLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGluamVjdCwgSW5qZWN0RmxhZ3MsIEluamVjdGlvblRva2VuIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEF1dGgsIGdldEF1dGgsIGluaXRpYWxpemVBdXRoIH0gZnJvbSBcImZpcmViYXNlL2F1dGhcIjtcbmltcG9ydCB7IEZJUkVCQVNFX0FQUCB9IGZyb20gXCJuZ2ZpcmUvYXBwXCI7XG5pbXBvcnQgeyBBVVRIX0RFUFMsIGdldENvbmZpZyB9IGZyb20gXCJuZ2ZpcmUvdG9rZW5zXCI7XG5cbmV4cG9ydCBjb25zdCBGSVJFX0FVVEggPSBuZXcgSW5qZWN0aW9uVG9rZW48QXV0aD4oJ0ZpcmUgYXV0aCBpbnN0YW5jZScsIHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICBmYWN0b3J5OiAoKSA9PiB7XG4gICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gICAgY29uc3QgYXBwID0gaW5qZWN0KEZJUkVCQVNFX0FQUCk7XG4gICAgY29uc3QgZGVwcyA9IGluamVjdChBVVRIX0RFUFMsIEluamVjdEZsYWdzLk9wdGlvbmFsKSB8fCB1bmRlZmluZWQ7XG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICByZXR1cm4gY29uZmlnLmF1dGgoYXBwLCBkZXBzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGRlcHMgPyBpbml0aWFsaXplQXV0aChhcHAsIGRlcHMpIDogZ2V0QXV0aChhcHApO1xuICAgIH1cbiAgfSxcbn0pO1xuXG4iXX0=