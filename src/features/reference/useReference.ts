import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchEnum } from './referenceSlice';
import type { EnumItem } from './referenceService';

export function createLookup<T extends EnumItem>(items: T[] | undefined, field: keyof T) {
    if (!items) {
        return (id: number | string) => `#${id}`;
    }

    const map = new Map<number | string, string>();

    items.forEach((item) => {
        const value = item[field];
        map.set(item.id, value ? String(value) : `#${item.id}`);
    });

    return (id: number | string) => map.get(id) ?? `#${id}`;
}

// ✅ базовый хук: по умолчанию name
export function useReference<T extends EnumItem = EnumItem>(
    enumName: string,
    field: keyof T = 'name' as keyof T,
) {
    const dispatch = useAppDispatch();

    const data = useAppSelector((state) => state.reference.data[enumName] as T[] | undefined);

    const loading = useAppSelector((state) => state.reference.loading[enumName] ?? false);

    const error = useAppSelector((state) => state.reference.error[enumName] ?? null);

    useEffect(() => {
        if (!data) {
            dispatch(fetchEnum(enumName));
        }
    }, [data, dispatch, enumName]);

    const lookup = useMemo(() => createLookup<T>(data, field), [data, field]);

    return {
        data,
        loading,
        error,
        lookup,
    };
}
