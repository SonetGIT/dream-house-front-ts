import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootAppState } from '@/app/store';
import { apiRequest } from '@/utils/apiRequest';
import type { ProjectBlock } from './projectBlocksSlice';
import type { Project } from '@/features/projects/a_project/projectsSlice';

export interface CopyBlockStructureParams {
    blockFrom: number;
    blockTo: number;
}

export interface CopyBlockStructureResult extends CopyBlockStructureParams {
    stages: number;
    subsections: number;
    items: number;
}

export const canCopyBlockStructure = (roleId: number | string | null | undefined) =>
    [1, 10, 11].includes(Number(roleId));

export async function loadCopyStructureProjects(): Promise<Project[]> {
    const projects = new Map<number, Project>();
    let page = 1;
    while (true) {
        const response = await apiRequest<Project[]>('/projects/search', 'POST', { page, size: 100 });
        for (const project of response.data) {
            if (!project.deleted) projects.set(project.id, project);
        }
        if (!response.pagination?.hasNext) break;
        if (response.data.length === 0) throw new Error('Не удалось загрузить все объекты');
        page += 1;
    }
    return [...projects.values()];
}

// The search API is paginated; the destination may be outside the first page.
export async function loadProjectBlockOptions(projectId: number): Promise<ProjectBlock[]> {
    const blocks = new Map<number, ProjectBlock>();
    let page = 1;
    while (true) {
        const response = await apiRequest<ProjectBlock[]>('/projectBlocks/search', 'POST', {
            project_id: projectId,
            page,
            size: 100,
        });
        for (const block of response.data) {
            if (block.project_id === projectId) blocks.set(block.id, block);
        }
        if (!response.pagination?.hasNext) break;
        if (response.data.length === 0) throw new Error('Не удалось загрузить все блоки проекта');
        page += 1;
    }
    return [...blocks.values()];
}

export const fetchStructureProjectBlocks = createAsyncThunk<
    ProjectBlock[], number, { rejectValue: string }
>('projectBlocks/structureOptions', async (projectId, { rejectWithValue }) => {
    try {
        return await loadProjectBlockOptions(projectId);
    } catch (error: unknown) {
        return rejectWithValue(error instanceof Error ? error.message : 'Ошибка загрузки блоков');
    }
});

export const copyBlockStructure = createAsyncThunk<
    CopyBlockStructureResult, CopyBlockStructureParams,
    { state: RootAppState; rejectValue: string }
>(
    'projectBlocks/copyStructure',
    async (params, { getState, rejectWithValue }) => {
        if (!canCopyBlockStructure(getState().auth.user?.role_id)) {
            return rejectWithValue('У вас нет прав на копирование структуры');
        }
        if (!Number.isSafeInteger(params.blockFrom) || params.blockFrom <= 0 ||
            !Number.isSafeInteger(params.blockTo) || params.blockTo <= 0 ||
            params.blockFrom === params.blockTo) {
            return rejectWithValue('Выберите другой блок назначения');
        }
        try {
            const response = await apiRequest<CopyBlockStructureResult>(
                '/projectBlocks/copyStructure', 'POST', params,
            );
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : 'Ошибка копирования структуры');
        }
    },
    { condition: (_, { getState }) => !getState().projectBlocks.copying },
);
