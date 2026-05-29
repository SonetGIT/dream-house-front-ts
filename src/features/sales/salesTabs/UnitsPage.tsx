import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { TablePagination } from '@/components/ui/TablePagination';
import { Add } from '@mui/icons-material';
import Modal from '@/components/ui/Modal';
import { calcRowTotal } from '@/utils/calcRowTotal';
import { useEffect, useState } from 'react';
import { fetchSalesUnits } from '../slices/salesUnitsSlice';

/*************************************************************************************************************************/
export default function UnitsPage() {
    const dispatch = useAppDispatch();
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);

    const { items, loading } = useAppSelector((state) => state.salesUnits);

    const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
    const [step, setStep] = useState<'select' | 'estimate' | 'form'>('select');

    const [refreshing, setRefreshing] = useState(false);

    const load = () => {
        setRefreshing(true);
        dispatch(fetchSalesUnits()).finally(() => setRefreshing(false));
    };

    useEffect(() => {
        load();
    }, []);

    //HANDLERS
    const handleCreate = () => {
        setModal('create');
    };

    // //SAFE RETURNS
    // if (!Number(projectId)) {
    //     return <div>Нет projectId</div>;
    // }

    // if (projectLoading) {
    //     return <div>Загрузка проекта...</div>;
    // }

    // if (!project) {
    //     return <div>Проект не найден</div>;
    // }

    //RENDER
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<Add />} onClick={handleCreate}>
                    Создать заявку
                </Button>
            </Box>

            {/* CONTENT */}
            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : items.length === 0 ? (
                <Typography color="text.secondary">Заявки отсутствуют</Typography>
            ) : (
                <>
                    <MaterialRequestsTable
                        data={materialRequests.filter((req) => req.project_id === project.id)}
                        refs={refs}
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
            <Modal
                size={step === 'estimate' || step === 'form' ? 'full' : 'xl'}
                isOpen={modal === 'create'}
                onClose={() => setModal(null)}
                title="Создать новую заявку"
            >
                <MaterialRequestFlow
                    step={step}
                    setStep={setStep}
                    projectId={Number(projectId)}
                    blockId={Number(blockId)}
                    refs={refs}
                    calcRowTotal={calcRowTotal}
                    onClose={() => setModal(null)}
                />
            </Modal>
        </Paper>
    );
}
