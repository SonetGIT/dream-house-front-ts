import { useRef, useState } from 'react';
import { createAsyncActionLock } from './asyncActionLock';

export function useAsyncActionLock() {
    const lock = useRef(createAsyncActionLock());
    const [pending, setPending] = useState(false);

    const run = <T,>(action: () => Promise<T>) => lock.current.run(async () => {
        setPending(true);
        try {
            return await action();
        } finally {
            setPending(false);
        }
    });

    return { pending, run, isLocked: lock.current.isLocked };
}
