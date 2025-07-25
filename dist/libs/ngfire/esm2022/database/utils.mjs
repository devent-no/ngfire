/** Recursively all Date into Timestamp */
export function fromDate(target) {
    if (typeof target !== 'object')
        return target;
    for (const key in target) {
        const value = target[key];
        if (!value || typeof value !== 'object')
            continue;
        if (value instanceof Date) {
            target[key] = value.getTime();
            continue;
        }
        fromDate(value);
    }
    return target;
}
/** Recursively all Date into Timestamp */
export function toDate(target, dateKeys, path = '') {
    if (typeof target !== 'object')
        return target;
    for (const key in target) {
        const value = target[key];
        const deepKey = `${path}.${key}`;
        if (dateKeys.includes(deepKey)) {
            if (typeof value !== 'number')
                throw new Error(`Date key "${deepKey}" is not a number. Got ${value}`);
            target[key] = new Date(value);
            continue;
        }
        if (!value || typeof value !== 'object')
            continue;
        toDate(value, dateKeys, deepKey);
    }
    return target;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9saWJzL25nZmlyZS9kYXRhYmFzZS9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMENBQTBDO0FBQzFDLE1BQU0sVUFBVSxRQUFRLENBQUksTUFBUztJQUNuQyxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVE7UUFBRSxPQUFPLE1BQU0sQ0FBQztJQUM5QyxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQ3pCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVE7WUFBRSxTQUFTO1FBQ2xELElBQUksS0FBSyxZQUFZLElBQUksRUFBRSxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxFQUFTLENBQUM7WUFDckMsU0FBUztRQUNYLENBQUM7UUFDRCxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRCwwQ0FBMEM7QUFDMUMsTUFBTSxVQUFVLE1BQU0sQ0FBSSxNQUFTLEVBQUUsUUFBa0IsRUFBRSxPQUFlLEVBQUU7SUFDeEUsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRO1FBQUUsT0FBTyxNQUFNLENBQUM7SUFDOUMsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUN6QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUIsTUFBTSxPQUFPLEdBQUcsR0FBRyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDakMsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDL0IsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsYUFBYSxPQUFPLDBCQUEwQixLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3RHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQVEsQ0FBQztZQUNyQyxTQUFTO1FBQ1gsQ0FBQztRQUNELElBQUksQ0FBQyxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUTtZQUFFLFNBQVM7UUFDbEQsTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogUmVjdXJzaXZlbHkgYWxsIERhdGUgaW50byBUaW1lc3RhbXAgKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tRGF0ZTxEPih0YXJnZXQ6IEQpOiBEIHtcbiAgaWYgKHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnKSByZXR1cm4gdGFyZ2V0O1xuICBmb3IgKGNvbnN0IGtleSBpbiB0YXJnZXQpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRhcmdldFtrZXldO1xuICAgIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JykgY29udGludWU7XG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgdGFyZ2V0W2tleV0gPSB2YWx1ZS5nZXRUaW1lKCkgYXMgYW55O1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGZyb21EYXRlKHZhbHVlKVxuICB9XG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbi8qKiBSZWN1cnNpdmVseSBhbGwgRGF0ZSBpbnRvIFRpbWVzdGFtcCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvRGF0ZTxEPih0YXJnZXQ6IEQsIGRhdGVLZXlzOiBzdHJpbmdbXSwgcGF0aDogc3RyaW5nID0gJycpOiBEIHtcbiAgaWYgKHR5cGVvZiB0YXJnZXQgIT09ICdvYmplY3QnKSByZXR1cm4gdGFyZ2V0O1xuICBmb3IgKGNvbnN0IGtleSBpbiB0YXJnZXQpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRhcmdldFtrZXldO1xuICAgIGNvbnN0IGRlZXBLZXkgPSBgJHtwYXRofS4ke2tleX1gO1xuICAgIGlmIChkYXRlS2V5cy5pbmNsdWRlcyhkZWVwS2V5KSkge1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpIHRocm93IG5ldyBFcnJvcihgRGF0ZSBrZXkgXCIke2RlZXBLZXl9XCIgaXMgbm90IGEgbnVtYmVyLiBHb3QgJHt2YWx1ZX1gKTtcbiAgICAgIHRhcmdldFtrZXldID0gbmV3IERhdGUodmFsdWUpIGFzIGFueTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIGNvbnRpbnVlO1xuICAgIHRvRGF0ZSh2YWx1ZSwgZGF0ZUtleXMsIGRlZXBLZXkpO1xuICB9XG4gIHJldHVybiB0YXJnZXQ7XG59XG5cblxuIl19