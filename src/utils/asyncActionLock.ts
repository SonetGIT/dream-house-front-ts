export function createAsyncActionLock() {
    let locked = false;
    return {
        isLocked: () => locked,
        async run<T>(action: () => Promise<T>): Promise<T | undefined> {
            if (locked) return undefined;
            locked = true;
            try {
                return await action();
            } finally {
                locked = false;
            }
        },
    };
}
