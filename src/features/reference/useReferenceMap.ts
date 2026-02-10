import { useReference } from './useReference';
import type { EnumItem } from './referenceService';

export interface RefItem {
    (id: string | number): string;
    data?: EnumItem[];
    loading: boolean;
    error: string | null;
}

export function useReferenceMap<T extends Record<string, (keyof EnumItem)[]>>(
    config: T,
): { [K in keyof T]: RefItem } {
    const result: Partial<{ [K in keyof T]: RefItem }> = {};

    Object.entries(config).forEach(([enumName, fields]) => {
        const { data, loading, error } = useReference(enumName);

        const field = fields[0];

        const fn = ((id: string | number) => {
            if (!data) return `#${id}`;
            const item = data.find((i) => i.id === id);
            return item ? String(item[field]) : `#${id}`;
        }) as RefItem;

        fn.data = data;
        fn.loading = loading;
        fn.error = error;

        result[enumName as keyof T] = fn;
    });

    return result as { [K in keyof T]: RefItem };
}
