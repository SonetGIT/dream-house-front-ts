import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { fetchProjects, setFilters } from '../projectsSlice';
import { useReference } from '../../reference/useReference';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { MdOutlineRestartAlt } from 'react-icons/md';
import PurchasingAgentItemsTable from './PurchasingAgentItemsTable';
import { Box } from '@mui/material';
import { fetchPurchasingAgentItems } from './materialRequestItemsSlice';

interface MaterialFilters {
    mType?: string | number;
    material?: string | number;
}

/*******************************************************************************************************************************************************************/
export default function MaterialRequestItems() {
    const dispatch = useAppDispatch();
    const { items, pagination } = useAppSelector((state) => state.materialRequestItems);
    // console.log('ITEMS', items);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Справочники
    const { data: statusType, lookup: getStatusName } = useReference(
        'beaaf9c2-b0d1-4c1c-8861-5723b936c334'
    );
    const { data: materialTypes, lookup: getMaterialTypeName } = useReference(
        '681635e7-3eff-413f-9a07-990bfe7bc68a'
    );
    const { data: materials, lookup: getMaterialName } = useReference(
        '7c52acfc-843a-4242-80ba-08f7439a29a7'
    );
    const { data: unitTypes, lookup: getUnitOfMeasure } = useReference(
        '2198d87a-d834-4c5d-abf8-8925aeed784e'
    );
    const { data: currency, lookup: getCurrencies } = useReference(
        '52fc32f7-44dd-42f2-92d2-bfcbb56f466d'
    );
    const { data: suppliers, lookup: getSuppliersName } = useReference(
        '7ec0dff6-a9cd-46fe-bc8a-d32f20bcdfbf'
    );

    const getRefName = useMemo(
        () => ({
            unitName: getUnitOfMeasure,
            materialType: getMaterialTypeName,
            materialName: getMaterialName,
            statusName: getStatusName,
            currencies: getCurrencies,
            suppliersName: getSuppliersName,
            materialTypes,
            materials,
            unitTypes,
            statusType,
            currency,
            suppliers,
        }),
        [
            getUnitOfMeasure,
            getMaterialTypeName,
            getMaterialName,
            getStatusName,
            getCurrencies,
            getSuppliersName,
            materialTypes,
            materials,
            unitTypes,
            statusType,
            currency,
            suppliers,
        ]
    );

    // Локальные состояния
    const [materialTypeId, setMaterialTypeId] = useState<string | number | null>(null);
    const [materialId, setMaterialId] = useState<string | number | null>(null);

    // ===== 1. Первичная загрузка =====
    useEffect(() => {
        dispatch(fetchPurchasingAgentItems({ page: 1, size: 10 }));
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
                // material_type: materialTypeId,
                // material_id: materialId,
            })
        );
    }, [materialTypeId, materialId]);

    useEffect(() => {
        setMaterialId(null);
    }, [materialTypeId]);
    const filteredMaterials = useMemo(() => {
        if (!materialTypeId) return [];
        return (materials || []).filter((m) => m.type === materialTypeId);
    }, [materials, materialTypeId]);

    // ===== 5. Сброс данные поиска и фильтра =====
    const handleReset = () => {
        setMaterialTypeId(null);
        setMaterialId(null);

        dispatch(setFilters({}));
        dispatch(fetchPurchasingAgentItems({ page: 1, size: 10 }));
    };

    // ===== 6. Пагинация =====
    const handleNextPage = () => {
        if (!pagination?.hasNext) return;
        dispatch(
            fetchPurchasingAgentItems({
                page: pagination.page + 1,
                size: pagination.size,
                /*search,*/
                // filters: getCurrentFilters(),
            })
        );
    };

    const handlePrevPage = () => {
        if (!pagination?.hasPrev) return;
        dispatch(
            fetchPurchasingAgentItems({
                page: pagination.page - 1,
                size: pagination.size,
                /*search,*/
                // filters: getCurrentFilters(),
            })
        );
    };

    /**********************************************************************************************************************************************/
    return (
        <>
            {!isFormOpen && (
                <Box>
                    {/* ======= ПОИСК И ФИЛЬТРЫ ======= */}
                    <div className="filter-container">
                        <ReferenceSelect
                            label="Тип материала"
                            value={materialTypeId || ''}
                            onChange={setMaterialTypeId}
                            options={materialTypes || []}
                        />

                        <ReferenceSelect
                            label="Материалы"
                            value={materialId || ''}
                            onChange={setMaterialId}
                            options={filteredMaterials}
                            disabled={!materialTypeId}
                        />

                        <StyledTooltip title="Сбросить фильтры и поиск">
                            <MdOutlineRestartAlt className="icon" onClick={handleReset} />
                        </StyledTooltip>
                    </div>

                    {/* ======= ТАБЛИЦА ======= */}
                    <PurchasingAgentItemsTable
                        items={items}
                        getRefName={getRefName}
                        pagination={pagination}
                        onPrevPage={handlePrevPage}
                        onNextPage={handleNextPage}
                    />
                </Box>
            )}
        </>
    );
}
