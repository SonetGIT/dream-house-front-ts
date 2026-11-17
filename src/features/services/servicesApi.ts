import { apiRequest } from '@/utils/apiRequest';

export type ServiceDirectory = 'services' | 'serviceTypes';

export interface ServiceRecord {
    id: number;
    name: string;
    service_type?: number | null;
    unit_of_measure?: number | null;
}

export interface ServiceQuery {
    page: number;
    size: number;
    search: string;
    service_type?: number;
}

export interface ServiceInput {
    name: string;
    service_type?: number;
}

export const searchDirectory = (directory: ServiceDirectory, query: ServiceQuery) =>
    apiRequest<ServiceRecord[]>(`/${directory}/search`, 'POST', query);

export const saveDirectoryRecord = (
    directory: ServiceDirectory,
    id: number | null,
    input: ServiceInput,
) => apiRequest<unknown>(
    id === null ? `/${directory}/create` : `/${directory}/update/${id}`,
    id === null ? 'POST' : 'PUT',
    input,
);

export const deleteDirectoryRecord = (directory: ServiceDirectory, id: number) =>
    apiRequest<unknown>(`/${directory}/delete/${id}`, 'DELETE');
