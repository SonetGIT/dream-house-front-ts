import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { TablePagination } from '@/components/ui/TablePagination';
import { useReference } from '@/features/reference/useReference';
import { fetchSalesOverview } from '../slices/salesObjOverviewSlice';
import ObjectsOverviewTable from './ObjectsOverviewTable';

/*************************************************************************************************************************/
export default function ObjectsOverviewPage() {
    const dispatch = useAppDispatch();
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);

    const { projects, blocks, loading, pagination } = useAppSelector(
        (state) => state.salesObjOverview,
    );
    // const currentProject = projects.filter((p) => p.id === )
    //Первичная загрузка
    useEffect(() => {
        dispatch(fetchSalesOverview());
    }, [dispatch, page, size]);
    const handleRefresh = () => {
        // Перезапрашиваем данные с теми же параметрами, чтобы получить обновленные блоки с новыми этажами
        dispatch(
            fetchSalesOverview({
                /* ваши текущие параметры поиска */
            }),
        );
    };
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
            ) : projects.length === 0 ? (
                <Typography color="text.secondary">Объекты отсутствуют</Typography>
            ) : (
                <>
                    <ObjectsOverviewTable
                        projects={projects}
                        blocks={blocks}
                        refs={refs}
                        onRefresh={handleRefresh}
                    />

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
