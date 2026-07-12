import { Box, Button, CircularProgress, Paper } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { TablePagination } from '@/components/ui/TablePagination';
import { useReference } from '@/features/reference/useReference';
import { fetchSalesOverview, type SalesOverviewUnit } from '../slices/salesObjOverviewSlice';
import ObjectsOverviewUnitsTable from './ObjectsOverviewUnitsTable';
import ObjectsOverviewUnitsFilters, {
    DEFAULT_UNIT_FILTERS,
    type UnitFilters,
} from './ObjectsOverviewUnitsFilters';
import { updateSalesUnit, type SalesUnit } from '../slices/salesUnitsSlice';
import {
    fetchSalesUnitFinishTypes,
    fetchSalesUnitStatuses,
} from '../slices/salesDictionariesSlice';
import toast from 'react-hot-toast';
import { Add } from '@mui/icons-material';
import { ObjectsOverviewUnitForm } from './ObjectsOverviewUnitForm';

// ---- Build search payload ----
export function buildPayload(filters: UnitFilters, page: number, size: number) {
    const payload: Record<string, unknown> = {
        page,
        size,
        include_units: true,
    };

    if (filters.sort_by) {
        payload.unit_sort = filters.sort_by;
    }

    if (filters.project_ids.length) {
        payload.project_ids = filters.project_ids;
    }

    if (filters.status_code.length) {
        payload.status_codes = filters.status_code;
    }

    if (filters.lot_types.length) {
        payload.lot_types = filters.lot_types;
    }

    if (filters.rooms > 0) {
        payload.rooms = filters.rooms;
    }

    if (filters.deal_manager_user_id > 0) {
        payload.deal_manager_user_id = filters.deal_manager_user_id;
    }

    if (filters.client_search.trim()) {
        payload.client_search = filters.client_search.trim();
    }
    if (filters.client_pin.trim()) {
        payload.client_pin = filters.client_pin.trim();
    }

    if (filters.client_passport.trim()) {
        payload.client_passport = filters.client_passport.trim();
    }

    // этажи
    if (filters.floor_exact) {
        const floor = Number(filters.floor_exact);
        if (!Number.isNaN(floor)) {
            payload.floor_number = floor;
        }
    } else {
        const from = Number(filters.floor_from);
        const to = Number(filters.floor_to);

        if (!Number.isNaN(from) && filters.floor_from) {
            payload.floor_from = from;
        }

        if (!Number.isNaN(to) && filters.floor_to) {
            payload.floor_to = to;
        }
    }

    // комнаты
    const roomsFrom = Number(filters.rooms_from);
    const roomsTo = Number(filters.rooms_to);

    if (!Number.isNaN(roomsFrom) && filters.rooms_from) {
        payload.rooms_from = roomsFrom;
    }

    if (!Number.isNaN(roomsTo) && filters.rooms_to) {
        payload.rooms_to = roomsTo;
    }

    // площадь
    const areaFrom = Number(filters.area_from);
    const areaTo = Number(filters.area_to);

    if (!Number.isNaN(areaFrom) && filters.area_from) {
        payload.area_from = areaFrom;
    }

    if (!Number.isNaN(areaTo) && filters.area_to) {
        payload.area_to = areaTo;
    }

    // цена
    const priceFrom = Number(filters.price_from);
    const priceTo = Number(filters.price_to);

    if (!Number.isNaN(priceFrom) && filters.price_from) {
        payload.price_from = priceFrom;
    }

    if (!Number.isNaN(priceTo) && filters.price_to) {
        payload.price_to = priceTo;
    }

    // цена за м²
    const priceM2From = Number(filters.price_m2_from);
    const priceM2To = Number(filters.price_m2_to);

    if (!Number.isNaN(priceM2From) && filters.price_m2_from) {
        payload.price_per_m2_from = priceM2From;
    }

    if (!Number.isNaN(priceM2To) && filters.price_m2_to) {
        payload.price_per_m2_to = priceM2To;
    }

    return payload;
}

export default function ObjectsOverviewUnitsPage() {
    const dispatch = useAppDispatch();
    const { units, loading, unitsPagination } = useAppSelector((state) => state.salesObjOverview);
    console.log('   🔄 units', unitsPagination);
    const { projects } = useAppSelector((s) => s.salesObjOverview);
    const { unitStatuses, finishTypes } = useAppSelector((s) => s.salesDictionaries);
    const [showFilters, setShowFilters] = useState(true);
    const [filters, setFilters] = useState<UnitFilters>(DEFAULT_UNIT_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<UnitFilters>(DEFAULT_UNIT_FILTERS);
    const [modal, setModal] = useState<{ mode: 'create' | 'edit'; unit?: SalesUnit } | null>(null);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);

    useEffect(() => {
        dispatch(fetchSalesUnitStatuses());
        dispatch(fetchSalesUnitFinishTypes());
    }, [dispatch]);

    const load = useCallback(
        async (f: UnitFilters, p: number, s: number) => {
            await dispatch(fetchSalesOverview(buildPayload(f, p, s)));
        },
        [dispatch],
    );

    useEffect(() => {
        load(appliedFilters, page, size);
    }, [appliedFilters, page, size, load]);

    function handleApply() {
        setPage(1);
        setAppliedFilters(filters);
    }
    const handleEdit = (unit: SalesOverviewUnit) => {
        setModal({ mode: 'edit', unit: unit as unknown as SalesUnit });
    };

    function handleReset() {
        setFilters(DEFAULT_UNIT_FILTERS);
        setAppliedFilters(DEFAULT_UNIT_FILTERS);
        setPage(1);
    }

    async function handleStatusChange(unitId: number, statusId: number) {
        const st = unitStatuses.find((s) => s.id === statusId);
        if (!st) return;

        try {
            await dispatch(
                updateSalesUnit({ id: unitId, payload: { status_id: statusId } }),
            ).unwrap();

            toast.success(`Статус изменён на «${st.name}»`);
            await load(appliedFilters, page, size);
        } catch (e) {
            toast.error(`Ошибка: ${e}`);
            load(appliedFilters, page, size);
        }
    }

    //
    function handleUnitSuccess() {
        // console.log('🔄 Обновляем таблицу лотов...');
        load(appliedFilters, page, size);
    }

    const projectStatuses = useReference('projectStatuses');
    const users = useReference('users');
    const currencies = useReference('currencies');
    const refs = {
        projectStatuses,
        users,
        currencies,
    };
    const managers = useMemo(
        () => (refs.users.data ?? []).filter((user: any) => String(user.role_id) === '16'),
        [refs.users.data],
    );

    if (loading) {
        return <div>Загрузка проекта...</div>;
    }

    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {showFilters && (
                        <ObjectsOverviewUnitsFilters
                            filters={filters}
                            projects={projects}
                            unitStatuses={unitStatuses}
                            onFiltersChange={setFilters}
                            onApply={handleApply}
                            onReset={handleReset}
                            managers={managers}
                        />
                    )}
                    <div className="flex items-center justify-end mb-3">
                        <Button
                            variant="outlined"
                            className="inline-flex items-center text-sm font-medium text-white transition bg-blue-600 rounded-lg h-9 hover:bg-blue-600 hover:text-white"
                            startIcon={<Add />}
                            onClick={() => setModal({ mode: 'create' })}
                        >
                            Создать лот
                        </Button>
                    </div>
                    <ObjectsOverviewUnitsTable
                        units={units}
                        refs={refs}
                        unitStatuses={unitStatuses}
                        finishTypes={finishTypes}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEdit}
                    />

                    {unitsPagination && (
                        <TablePagination
                            pagination={unitsPagination}
                            onPageChange={(newPage) => setPage(newPage)}
                            onSizeChange={(newSize) => {
                                setPage(1);
                                setSize(newSize);
                            }}
                            sizeOptions={[10, 25, 50, 100]}
                            showFirstButton
                            showLastButton
                        />
                    )}
                </>
            )}
            {/* MODALS */}
            {modal && (
                <ObjectsOverviewUnitForm
                    mode={modal.mode}
                    unit={modal.unit}
                    unitStatuses={unitStatuses}
                    finishTypes={finishTypes}
                    refs={refs}
                    onClose={() => setModal(null)}
                    onSuccess={handleUnitSuccess}
                />
            )}
        </Paper>
    );
}
