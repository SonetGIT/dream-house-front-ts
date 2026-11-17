import { apiRequest } from '@/utils/apiRequest';

export interface MaterialType {
    id: number;
    name: string;
}

export interface MaterialTypesQuery {
    name: string;
    page: number;
    size: number;
}

export const searchMaterialTypes = (query: MaterialTypesQuery) =>
    apiRequest<MaterialType[]>('/materialTypes/search', 'POST', query);

export function saveMaterialType(id: number | null, name: string) {
    if (!name.trim()) throw new Error('Укажите название типа материала');
    return apiRequest<unknown>(
        id === null ? '/materialTypes/create' : `/materialTypes/update/${id}`,
        id === null ? 'POST' : 'PUT',
        { name: name.trim() },
    );
}

export const deleteMaterialType = (id: number) =>
    apiRequest<unknown>(`/materialTypes/delete/${id}`, 'DELETE');
