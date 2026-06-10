import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { TablePagination } from '@/components/ui/TablePagination';
import { useReference } from '@/features/reference/useReference';
import { fetchSalesOverview } from '../slices/salesObjOverviewSlice';
import ObjectsOverviewUnitsTable from './ObjectsOverviewUnitsTable';
import ObjectsOverviewUnitsFilters, {
    DEFAULT_UNIT_FILTERS,
    type UnitFilters,
} from './ObjectsOverviewUnitsFilters';
import { fetchSalesUnits } from '../slices/salesUnitsSlice';
import { fetchSalesUnitStatuses } from '../slices/salesDictionariesSlice';

// ---- Build search payload ----
interface SalesUnitsSearchPayload {
    // search?: string;
    // project_id?: number | null;
    // block_id?: number | null;
    // floor_id?: number | null;
    // status_id?: number | null;
    // lot_type?: string | null;
    // rooms?: number | null;
    // manager_user_id?: number | null;
    // is_active_for_sale?: boolean | null;
    // page?: number;
    // size?: number;

    sort_by?: string;
    sort_desc?: boolean;
    project_ids?: number[];
    floor_exact?: string;
    floor_from?: number | string;
    floor_to?: number | string;
    status_code?: string[];
    lot_types?: string[];
    rooms?: number;
    rooms_from?: number | string;
    rooms_to?: number | string;
    area_from?: number | string;
    area_to?: number | string;
    price_from?: number | string;
    price_to?: number | string;
    price_m2_from?: number | string;
    price_m2_to?: number | string;
    manager_user_id?: number;
    client_search?: string;
    client_pin?: string;
    client_passport?: string;
    page?: number;
    size?: number;
}
function buildPayload(filters: UnitFilters, search: string, page: number): SalesUnitsSearchPayload {
    const payload: SalesUnitsSearchPayload = {
        page,
        size: 25,
        sort_by: filters.sort_by,
        sort_desc: filters.sort_desc,
    };
    if (search.trim()) payload.client_search = search.trim();
    if (filters.project_ids.length > 0) payload.project_ids = filters.project_ids;
    if (filters.status_code.length > 0) payload.status_code = filters.status_code;
    if (filters.lot_types.length > 0) payload.lot_types = filters.lot_types;
    if (filters.rooms > 0) payload.rooms = filters.rooms;
    if (filters.manager_user_id > 0) payload.manager_user_id = filters.manager_user_id;

    if (filters.floor_exact) {
        const n = parseInt(filters.floor_exact);
        if (!isNaN(n)) {
            payload.floor_from = n;
            payload.floor_to = n;
        }
    } else {
        if (filters.floor_from) {
            const n = parseInt(filters.floor_from);
            if (!isNaN(n)) payload.floor_from = n;
        }
        if (filters.floor_to) {
            const n = parseInt(filters.floor_to);
            if (!isNaN(n)) payload.floor_to = n;
        }
    }
    if (filters.rooms_from) {
        const n = parseInt(filters.rooms_from);
        if (!isNaN(n)) payload.rooms_from = n;
    }
    if (filters.rooms_to) {
        const n = parseInt(filters.rooms_to);
        if (!isNaN(n)) payload.rooms_to = n;
    }
    if (filters.area_from) {
        const n = parseFloat(filters.area_from);
        if (!isNaN(n)) payload.area_from = n;
    }
    if (filters.area_to) {
        const n = parseFloat(filters.area_to);
        if (!isNaN(n)) payload.area_to = n;
    }
    if (filters.price_from) {
        const n = parseFloat(filters.price_from);
        if (!isNaN(n)) payload.price_from = n;
    }
    if (filters.price_to) {
        const n = parseFloat(filters.price_to);
        if (!isNaN(n)) payload.price_to = n;
    }
    if (filters.price_m2_from) {
        const n = parseFloat(filters.price_m2_from);
        if (!isNaN(n)) payload.price_m2_from = n;
    }
    if (filters.price_m2_to) {
        const n = parseFloat(filters.price_m2_to);
        if (!isNaN(n)) payload.price_m2_to = n;
    }
    return payload;
}
/*************************************************************************************************************************/
export default function ObjectsOverviewUnitsPage() {
    const dispatch = useAppDispatch();
    const { units, loading, unitsPagination } = useAppSelector((state) => state.salesObjOverview);
    const { projects } = useAppSelector((s) => s.salesObjOverview);
    const { unitStatuses } = useAppSelector((s) => s.salesDictionaries);
    const [showFilters, setShowFilters] = useState(true);
    const [filters, setFilters] = useState<UnitFilters>(DEFAULT_UNIT_FILTERS);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);

    //Первичная загрузка =====
    // useEffect(() => {
    //     dispatch(
    //         fetchSalesOverview({
    //             page,
    //             size,

    //             include_units: true,

    //             unit_page: page,
    //             unit_size: size,
    //             unit_sort: 'created_desc',
    //         }

    //     );
    //     dispatch(fetchSalesUnitStatuses());
    // }, [dispatch, page, size]);
    useEffect(() => {
        dispatch(fetchSalesOverview({ page, size, include_units: true }));
        dispatch(fetchSalesUnitStatuses());
        load(DEFAULT_UNIT_FILTERS, '', 1);
    }, [dispatch, page, size]);

    const load = useCallback(
        (f: UnitFilters, s: string, p: number) => {
            dispatch(fetchSalesUnits(buildPayload(f, s, p)));
        },
        [dispatch],
    );

    useEffect(() => {
        dispatch(fetchSalesOverview({}));
        dispatch(fetchSalesUnitStatuses());
        load(DEFAULT_UNIT_FILTERS, '', 1);
    }, []);
    function handleApply() {
        setPage(1);
        load(filters, search, 1);
    }

    function handleReset() {
        setFilters(DEFAULT_UNIT_FILTERS);
        setSearch('');
        setPage(1);
        load(DEFAULT_UNIT_FILTERS, '', 1);
    }
    // hooks всегда вызываются одинаково
    const projectStatuses = useReference('projectStatuses');

    const refs = {
        projectStatuses,
    };

    if (loading) {
        return <div>Загрузка проекта...</div>;
    }

    /*RENDER************************************************************************************************************/
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* CONTENT */}
            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : units.length === 0 ? (
                <Typography color="text.secondary">Лоты отсутствуют</Typography>
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
                        />
                    )}
                    <ObjectsOverviewUnitsTable units={units} refs={refs} />

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
        </Paper>
    );
}
