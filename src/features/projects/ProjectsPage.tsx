import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchProjects, setSearch, setFilters } from './projectsSlice';
import ProjectsTable from './ProjectsTable';
import InputSearch from '@/components/ui/InputSearch';
import { useReference } from '../reference/useReference';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { MdOutlineRestartAlt } from 'react-icons/md';

interface ProjectFilters {
    type?: string | number;
    status?: string | number;
}
/*******************************************************************************************************************************************************************/
export default function ProjectsPage() {
    const dispatch = useAppDispatch();
    const { items, pagination, loading, error, search } = useAppSelector((state) => state.projects);

    // Справочники
    const {
        data: projectTypes,
        lookup: getProjectTypeName,
        loading: loadingTypes,
    } = useReference('0e86b36a-aa48-4993-874f-1ce21cd3931d');

    const {
        data: projectStatuses,
        lookup: getProjectStatusName,
        loading: loadingStatuses,
    } = useReference('231fec20-3f64-4343-8d49-b1d53e71ad4d');

    const getRefName = {
        type: getProjectTypeName,
        status: getProjectStatusName,
    };

    // Локальные состояния
    const [searchText, setSearchText] = useState('');
    const [projectTypeId, setProjectTypeId] = useState<string | number | null>(null);
    const [projectStatusId, setProjectStatusId] = useState<string | number | null>(null);

    // ===== 1. Первичная загрузка =====
    useEffect(() => {
        dispatch(fetchProjects({ page: 1, size: 10 }));
    }, [dispatch]);

    // ===== 2. Формирование фильтров =====
    const getCurrentFilters = (): ProjectFilters => {
        const currentFilters: ProjectFilters = {};
        if (projectTypeId) currentFilters.type = projectTypeId;
        if (projectStatusId) currentFilters.status = projectStatusId;
        return currentFilters;
    };

    // ===== 3. Поиск =====
    const handleSearch = () => {
        dispatch(setSearch(searchText));
        const currentFilters = getCurrentFilters();
        dispatch(setFilters(currentFilters));
        dispatch(fetchProjects({ page: 1, size: 10, search: searchText, filters: currentFilters }));
    };

    useEffect(() => {
        if (searchText.trim() === '') {
            dispatch(fetchProjects({ page: 1 }));
        } else {
            dispatch(fetchProjects({ page: 1, search }));
        }
    }, [searchText]);
    // ===== 4. Авто-обновление фильтров при выборе =====
    useEffect(() => {
        const newFilters = getCurrentFilters();
        dispatch(setFilters(newFilters));
        dispatch(fetchProjects({ page: 1, size: 10, search, filters: newFilters }));
    }, [projectTypeId, projectStatusId]);

    // ===== 5. Сброс данные поиска и филтра =====
    const handleReset = () => {
        setSearchText('');
        setProjectTypeId(null);
        setProjectStatusId(null);

        dispatch(setSearch(''));
        dispatch(setFilters({}));
        dispatch(fetchProjects({ page: 1, size: 10 }));
    };

    // ===== 6. Пагинация =====
    const handleNextPage = () => {
        if (!pagination?.hasNext) return;
        dispatch(
            fetchProjects({
                page: pagination.page + 1,
                size: pagination.size,
                search,
                filters: getCurrentFilters(),
            })
        );
    };

    const handlePrevPage = () => {
        if (!pagination?.hasPrev) return;
        dispatch(
            fetchProjects({
                page: pagination.page - 1,
                size: pagination.size,
                search,
                filters: getCurrentFilters(),
            })
        );
    };

    /***********************************************************************************************************************************************************/
    return (
        <div>
            {/* ======= ПОИСК И ФИЛЬТРЫ ======= */}
            <div className="filter-container">
                <InputSearch value={searchText} onChange={setSearchText} onEnter={handleSearch} />

                <ReferenceSelect
                    label="Тип проекта"
                    value={projectTypeId || ''}
                    onChange={setProjectTypeId}
                    options={projectTypes || []}
                    loading={loadingTypes}
                />

                <ReferenceSelect
                    label="Статус проекта"
                    value={projectStatusId || ''}
                    onChange={setProjectStatusId}
                    options={projectStatuses || []}
                    loading={loadingStatuses}
                />

                <StyledTooltip title="Сбросить фильтры и поиск">
                    <MdOutlineRestartAlt className="icon" onClick={handleReset} />
                </StyledTooltip>
            </div>

            {/* ======= ТАБЛИЦА ======= */}
            <ProjectsTable
                items={items}
                loading={loading}
                error={error}
                pagination={pagination}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                getRefName={getRefName}
            />
        </div>
    );
}
