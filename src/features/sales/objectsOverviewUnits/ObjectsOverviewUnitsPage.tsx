import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { TablePagination } from '@/components/ui/TablePagination';
import { useReference } from '@/features/reference/useReference';
import { fetchSalesOverview } from '../slices/salesObjOverviewSlice';
import ObjectsOverviewUnitsTable from './ObjectsOverviewUnitsTable';

/*************************************************************************************************************************/
export default function ObjectsOverviewUnitsPage() {
    const dispatch = useAppDispatch();
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);

    const { units, loading, pagination } = useAppSelector((state) => state.salesObjOverview);
    //Первичная загрузка =====
    useEffect(() => {
        dispatch(
            fetchSalesOverview({
                page,
                size,

                include_units: true,

                unit_page: page,
                unit_size: size,
                unit_sort: 'created_desc',
            }),
        );
    }, [dispatch, page, size]);

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
                    <ObjectsOverviewUnitsTable units={units} refs={refs} />

                    {pagination && (
                        <TablePagination
                            pagination={pagination}
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
