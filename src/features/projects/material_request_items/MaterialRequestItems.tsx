import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { setFilters } from '../projectsSlice';
import PurchasingAgentItemsTable from './PurchasingAgentItemsTable';
import { Box } from '@mui/material';
import { fetchPurchasingAgentItems } from './materialRequestItemsSlice';
import { useOutletContext } from 'react-router-dom';
import type { ProjectOutletContext } from '../material_request/MaterialRequests';
import { useReference } from '@/features/reference/useReference';

interface MaterialFilters {
    mType?: string | number;
    material?: string | number;
}

/*******************************************************************************************************************************************************************/
export default function MaterialRequestItems() {
    const { projectId } = useOutletContext<ProjectOutletContext>();
    const dispatch = useAppDispatch();
    const { items, pagination } = useAppSelector((state) => state.materialRequestItems);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Справочники
    const refs = {
        materialRequestItemStatuses: useReference('materialRequestItemStatuses'),
        materialTypes: useReference('materialTypes'),
        materials: useReference('materials'),
        unitsOfMeasure: useReference('unitsOfMeasure'),
        currencies: useReference('currencies'),
        suppliers: useReference('suppliers'),
    };

    const fullyOrderedStatusId = useMemo(() => {
        return refs.materialRequestItemStatuses.data?.find((s) => s.id === 4)?.id;
    }, [refs.materialRequestItemStatuses.data]);

    // Локальные состояния
    const [materialTypeId, setMaterialTypeId] = useState<string | number | null>(null);
    const [materialId, setMaterialId] = useState<string | number | null>(null);

    // ===== 1. Первичная загрузка =====
    useEffect(() => {
        dispatch(fetchPurchasingAgentItems({ page: 1, size: 10, project_id: projectId }));
    }, [dispatch]);

    // ===== 2. Формирование фильтров =====
    const getCurrentFilters = (): MaterialFilters => {
        const currentFilters: MaterialFilters = {};
        if (materialTypeId) currentFilters.mType = materialTypeId;
        if (materialId) currentFilters.material = materialId;
        return currentFilters;
    };

    // ===== 3. Авто-обновление фильтров при выборе =====
    useEffect(() => {
        dispatch(setFilters(getCurrentFilters()));

        dispatch(
            fetchPurchasingAgentItems({
                page: 1,
                size: 10,
                project_id: projectId,
                // material_type: materialTypeId,
                // material_id: materialId,
            }),
        );
    }, [materialTypeId, materialId]);

    useEffect(() => {
        setMaterialId(null);
    }, [materialTypeId]);

    // ===== 6. Пагинация =====
    const handleNextPage = () => {
        if (!pagination?.hasNext) return;
        dispatch(
            fetchPurchasingAgentItems({
                page: pagination.page + 1,
                size: pagination.size,
                project_id: projectId,
                /*search,*/
                // filters: getCurrentFilters(),
            }),
        );
    };

    const handlePrevPage = () => {
        if (!pagination?.hasPrev) return;
        dispatch(
            fetchPurchasingAgentItems({
                page: pagination.page - 1,
                size: pagination.size,
                project_id: projectId,
                /*search,*/
                // filters: getCurrentFilters(),
            }),
        );
    };

    /**********************************************************************************************************************************************/
    return (
        <>
            {!isFormOpen && (
                <Box>
                    {/* ======= ТАБЛИЦА ======= */}
                    <PurchasingAgentItemsTable
                        items={items}
                        refs={refs}
                        pagination={pagination}
                        onPrevPage={handlePrevPage}
                        onNextPage={handleNextPage}
                        fullyOrderedStatusId={fullyOrderedStatusId}
                    />
                </Box>
            )}
        </>
    );
}
