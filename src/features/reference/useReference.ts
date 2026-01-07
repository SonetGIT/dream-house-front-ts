import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchEnum } from './referenceSlice';
import type { EnumItem } from './referenceService';

//НОВОЕ: вспомогательная функция вне хука
export function createLookup(items?: EnumItem[]) {
    if (!items) {
        return (id: number | string) => `#${id}`;
    }

    const map = new Map<number | string, string>();

    items.forEach((item) => {
        // 🔹 Защита от null/undefined
        const name = item.name ?? `#${item.id}`;
        map.set(item.id, String(name));
    });

    return (id: number | string) => map.get(id) ?? `#${id}`;
}

// хук — возвращает и данные, и lookup
export function useReference(enumName: string) {
    const dispatch = useAppDispatch();
    const data = useAppSelector((state) => state.reference.data[enumName]);
    const loading = useAppSelector((state) => state.reference.loading[enumName] ?? false);
    const error = useAppSelector((state) => state.reference.error[enumName] ?? null);
    // console.log('data', data);
    useEffect(() => {
        if (!data) {
            dispatch(fetchEnum(enumName));
        }
    }, [data, dispatch, enumName]);

    //ДОБАВЛЕНО: мемоизированный lookup
    const lookup = useMemo(() => createLookup(data), [data]);

    return {
        data,
        loading,
        error,
        lookup,
    };
}
