import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchEnum } from './referenceSlice';
import type { EnumItem } from './referenceService';
import { getToken } from '../auth/getToken';

//НОВОЕ: вспомогательная функция вне хука
export function createLookup(items?: EnumItem[]) {
    if (!items || items.length === 0) {
        return (id: string | number) => `#${id}`;
    }

    const map = new Map<string, string>();

    items.forEach((item) => {
        map.set(String(item.id), String(item.name ?? `#${item.id}`));
    });

    return (id: string | number) => map.get(String(id)) ?? `#${id}`;
}

// хук — возвращает и данные, и lookup
export function useReference(enumName: string) {
    const dispatch = useAppDispatch();
    // const reduxToken = useAppSelector((s) => s.auth.token);
    // const token = reduxToken ?? getToken();

    const token = getToken();
    const data = useAppSelector((state) => state.reference.data[enumName]);
    const loading = useAppSelector((state) => state.reference.loading[enumName] ?? false);
    const error = useAppSelector((state) => state.reference.error[enumName] ?? null);

    useEffect(() => {
        if (!token) return;

        // 🔥 КЛЮЧЕВОЕ УСЛОВИЕ
        if (!data && !loading && !error) {
            dispatch(fetchEnum(enumName));
        }
    }, [token, data, loading, error, enumName, dispatch]);

    const lookup = useMemo(() => createLookup(data), [data]);

    return { data, loading, error, lookup };
}
