import { inject, InjectFlags, InjectionToken } from "@angular/core";
import { getStorage } from "firebase/storage";
import { FIREBASE_APP } from "ngfire/app";
import { getConfig, STORAGE_BUCKET } from "ngfire/tokens";
export const FIRE_STORAGE = new InjectionToken('Firebase Storage', {
    providedIn: 'root',
    factory: () => {
        const config = getConfig();
        const app = inject(FIREBASE_APP);
        const bucket = inject(STORAGE_BUCKET, InjectFlags.Optional);
        if (config.storage) {
            return config.storage(app, bucket ?? undefined);
        }
        else {
            return getStorage(app, bucket ?? undefined);
        }
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbGlicy9uZ2ZpcmUvc3RvcmFnZS9zcmMvdG9rZW5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNwRSxPQUFPLEVBQW1CLFVBQVUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQy9ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDMUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHMUQsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxDQUFrQixrQkFBa0IsRUFBRTtJQUNsRixVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFO1FBQ1osTUFBTSxNQUFNLEdBQUcsU0FBUyxFQUFFLENBQUM7UUFDM0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxjQUFjLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVELElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNsQixPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLE1BQU0sSUFBSSxTQUFTLENBQUMsQ0FBQztTQUNqRDthQUFNO1lBQ0wsT0FBTyxVQUFVLENBQUMsR0FBRyxFQUFFLE1BQU0sSUFBSSxTQUFTLENBQUMsQ0FBQztTQUM3QztJQUNILENBQUM7Q0FDRixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpbmplY3QsIEluamVjdEZsYWdzLCBJbmplY3Rpb25Ub2tlbiB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBGaXJlYmFzZVN0b3JhZ2UsIGdldFN0b3JhZ2UgfSBmcm9tIFwiZmlyZWJhc2Uvc3RvcmFnZVwiO1xuaW1wb3J0IHsgRklSRUJBU0VfQVBQIH0gZnJvbSBcIm5nZmlyZS9hcHBcIjtcbmltcG9ydCB7IGdldENvbmZpZywgU1RPUkFHRV9CVUNLRVQgfSBmcm9tIFwibmdmaXJlL3Rva2Vuc1wiO1xuXG5cbmV4cG9ydCBjb25zdCBGSVJFX1NUT1JBR0UgPSBuZXcgSW5qZWN0aW9uVG9rZW48RmlyZWJhc2VTdG9yYWdlPignRmlyZWJhc2UgU3RvcmFnZScsIHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICBmYWN0b3J5OiAoKSA9PiB7XG4gICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gICAgY29uc3QgYXBwID0gaW5qZWN0KEZJUkVCQVNFX0FQUCk7XG4gICAgY29uc3QgYnVja2V0ID0gaW5qZWN0KFNUT1JBR0VfQlVDS0VULCBJbmplY3RGbGFncy5PcHRpb25hbCk7XG4gICAgaWYgKGNvbmZpZy5zdG9yYWdlKSB7XG4gICAgICByZXR1cm4gY29uZmlnLnN0b3JhZ2UoYXBwLCBidWNrZXQgPz8gdW5kZWZpbmVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGdldFN0b3JhZ2UoYXBwLCBidWNrZXQgPz8gdW5kZWZpbmVkKTtcbiAgICB9XG4gIH0sXG59KTtcbiJdfQ==