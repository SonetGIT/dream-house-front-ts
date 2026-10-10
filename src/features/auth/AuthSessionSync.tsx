import { useEffect } from 'react';
import { useAppDispatch } from '@/app/store';
import { fetchProfile, syncSession } from './authSlice';
import { authClient, subscribeAuthSession } from './authSession';

export default function AuthSessionSync() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        let generation: string | null | undefined;
        const sync = () => {
            const session = authClient.getSession();
            dispatch(syncSession(session ? {
                generation: session.generation,
                userId: session.userId,
            } : null));
            if (generation !== (session?.generation ?? null)) {
                generation = session?.generation ?? null;
                if (session) void dispatch(fetchProfile());
                else sessionStorage.removeItem('resetPasswordSource');
            }
        };
        const unsubscribe = subscribeAuthSession(sync);
        sync();
        return unsubscribe;
    }, [dispatch]);

    return null;
}
