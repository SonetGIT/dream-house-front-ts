import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchProjects, setSearch, setFilters } from '../projectsSlice';
import InputSearch from '@/components/ui/InputSearch';
import { useReference } from '../../reference/useReference';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { MdOutlineRestartAlt, MdSkipNext, MdSkipPrevious } from 'react-icons/md';
import PurchasingAgentItemsTable from './PurchasingAgentItemsTable';
import { Box, IconButton } from '@mui/material';

interface ProjectFilters {
    type?: string | number;
    status?: string | number;
}
/*******************************************************************************************************************************************************************/
export default function MaterialRequestItems() {
    const dispatch = useAppDispatch();
    const { items, pagination, loading, error } = useAppSelector(
        (state) => state.materialRequestItems
    );
    // console.log('ITEMS', items);
    const [isFormOpen, setIsFormOpen] = useState(false);
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

    const { data: materialTypes, lookup: getMaterialTypeName } = useReference(
        '681635e7-3eff-413f-9a07-990bfe7bc68a'
    );
    const { data: materials, lookup: getMaterialName } = useReference(
        '7c52acfc-843a-4242-80ba-08f7439a29a7'
    );
    const { data: unitTypes, lookup: getUnitOfMeasure } = useReference(
        '2198d87a-d834-4c5d-abf8-8925aeed784e'
    );

    const { lookup: getUserName } = useReference('d0336075-e674-41ef-aa38-189de9adaeb4');
    const { lookup: getMatReqStatusName } = useReference('c1aa58c8-2419-4832-ba09-8c54f27b5bf3');

    const getRefName = useMemo(
        () => ({
            projectType: getProjectTypeName,
            projectStatus: getProjectStatusName,
            unitName: getUnitOfMeasure,
            materialType: getMaterialTypeName,
            materialName: getMaterialName,
            userName: getUserName,
            statusName: getMatReqStatusName,
            materialTypes,
            materials,
            unitTypes,
        }),
        [
            getUnitOfMeasure,
            getMaterialTypeName,
            getMaterialName,
            getUserName,
            getMatReqStatusName,
            materialTypes,
            materials,
            unitTypes,
        ]
    );

    // Локальные состояния
    const [searchText, setSearchText] = useState('');
    const [projectTypeId, setProjectTypeId] = useState<string | number | null>(null);
    const [projectStatusId, setProjectStatusId] = useState<string | number | null>(null);

    // ===== 1. Первичная загрузка =====
    // useEffect(() => {
    //     dispatch(fetchProjects({ page: 1, size: 10 }));
    // }, [dispatch]);

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

    // useEffect(() => {
    //     if (searchText.trim() === '') {
    //         dispatch(fetchProjects({ page: 1 }));
    //     } else {
    //         dispatch(fetchProjects({ page: 1 }));
    //         // dispatch(fetchProjects({ page: 1, search }));
    //     }
    // }, [searchText]);
    // ===== 4. Авто-обновление фильтров при выборе =====
    // useEffect(() => {
    //     const newFilters = getCurrentFilters();
    //     dispatch(setFilters(newFilters));
    //     dispatch(fetchProjects({ page: 1, size: 10, filters: newFilters }));
    //     // dispatch(fetchProjects({ page: 1, size: 10, search, filters: newFilters }));
    // }, [projectTypeId, projectStatusId]);

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
                /*search,*/
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
                /*search,*/
                filters: getCurrentFilters(),
            })
        );
    };

    /***********************************************************************************************************************************************************/
    return (
        <>
            {!isFormOpen && (
                <Box>
                    {/* ======= ПОИСК И ФИЛЬТРЫ ======= */}
                    <div className="filter-container">
                        <InputSearch
                            value={searchText}
                            onChange={setSearchText}
                            onEnter={handleSearch}
                        />

                        <ReferenceSelect
                            label="Тип материала"
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
                    <PurchasingAgentItemsTable
                        items={items}
                        // loading={loading}
                        // error={error}
                        // pagination={pagination}
                        // onPrevPage={handlePrevPage}
                        // onNextPage={handleNextPage}
                        getRefName={getRefName}
                    />

                    {/*Пагинация****************************************************************************************************/}
                    <div className="table-footer-container">
                        <div className="pagination">
                            <StyledTooltip title="Предыдущая страница">
                                <span>
                                    <IconButton
                                        size="small"
                                        className="table-page-button"
                                        onClick={handleNextPage}
                                        disabled={!pagination?.hasPrev}
                                    >
                                        <MdSkipPrevious />
                                    </IconButton>
                                </span>
                            </StyledTooltip>

                            <span className="page-text">стр. {pagination?.page}</span>
                            <span className="page-text"> из {pagination?.pages}</span>

                            <StyledTooltip title="Следующая страница">
                                <span>
                                    <IconButton
                                        size="small"
                                        className="table-page-button"
                                        onClick={handlePrevPage}
                                        disabled={!pagination?.hasNext}
                                    >
                                        <MdSkipNext />
                                    </IconButton>
                                </span>
                            </StyledTooltip>
                            <span className="page-count">Кол-во: {pagination?.total}</span>
                        </div>
                    </div>
                </Box>
            )}
        </>
    );
}
