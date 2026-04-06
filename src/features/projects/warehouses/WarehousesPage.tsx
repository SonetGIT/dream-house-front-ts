import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useReference } from '../../reference/useReference';
import { fetchWarehouses } from './warehousesSlice';
import WarehousesList from './WarehousesTable';
import { useOutletContext } from 'react-router-dom';
import type { ProjectOutletContext } from '../pto/PtoPage';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Box, Button, CircularProgress, Paper } from '@mui/material';
import { CheckCircle2, FolderOpen, TrendingUp, XCircle } from 'lucide-react';
import { Add } from '@mui/icons-material';
import WarehousesTable from './WarehousesTable';
import { TablePagination } from '@/components/ui/TablePagination';

/*******************************************************************************************************************************************************************/
export default function WarehousesPage() {
    const { projectId } = useOutletContext<ProjectOutletContext>();
    const projectIdNum = projectId ? Number(projectId) : null;
    const dispatch = useAppDispatch();
    const { data, pagination, loading } = useAppSelector((state) => state.warehouses);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    // Справочники
    const refs = { users: useReference('users') };

    //Первичная загрузка =====
    useEffect(() => {
        dispatch(fetchWarehouses({ page, size, project_id: projectId }));
    }, [projectId, page, size]);

    const emptyWarehouses = data.filter((w) => !w.items?.length).length;
    const filledWarehouses = data.filter((w) => w.items && w.items.length > 0).length;
    const fillPercent = data.length > 0 ? Math.round((filledWarehouses / data.length) * 100) : 0;

    /********************************************************************************************************************************************/
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => alert('handleCreate')}
                >
                    Добавить склад
                </Button>
            </Box>

            <div className="flex items-center gap-6 mb-6 text-sm">
                <div className="flex items-center gap-2">
                    <CheckCircle2 style={{ width: '16px', height: '16px', color: '#4caf50' }} />
                    <span style={{ fontSize: '13px', color: '#757575' }}>Заполненных:</span>
                    <span
                        className="rounded"
                        style={{
                            backgroundColor: '#4caf50',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '1px 8px',
                        }}
                    >
                        {filledWarehouses}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <XCircle style={{ width: '16px', height: '16px', color: '#f44336' }} />
                    <span style={{ fontSize: '13px', color: '#757575' }}>Пустых:</span>
                    <span
                        className="rounded"
                        style={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '1px 8px',
                        }}
                    >
                        {emptyWarehouses}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <TrendingUp style={{ width: '16px', height: '16px', color: '#9c27b0' }} />
                    <span style={{ fontSize: '13px', color: '#757575' }}>Заполнение:</span>
                    <span
                        className="rounded"
                        style={{
                            backgroundColor: '#9c27b0',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '1px 8px',
                        }}
                    >
                        {fillPercent}%
                    </span>
                </div>
            </div>
            {/* CONTENT */}
            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : data.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                        <FolderOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="mb-1 text-base font-medium text-gray-900">
                        В объекте отсутствуют склады. Добавьте новый склад нажав на кнопку "
                        Добавить склад".
                    </h3>
                </div>
            ) : (
                <>
                    <WarehousesTable
                        data={data}
                        refs={refs}
                        //     onDeleteMatReqOrderId={(id) => setDeleteState({ type: 'matReqOrder', id })}
                        //     onDeleteMatReqOrderItemId={(itemId) =>
                        //         setDeleteState({ type: 'matReqOrderItem', id: itemId })
                        //     }
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
            {/* <Modal
                size={'full'}
                isOpen={modal === 'create'}
                onClose={() => setModal(null)}
                title="Список одобренных материалов"
            >
                <MatReqItemsSelectTable
                    items={filteredItems}
                    refs={refs}
                    onCancel={() => setModal(null)}
                    onSubmit={handleCreatePurchaseOrder}
                />
            </Modal> */}

            {/* DELETE CONFIRM */}
            {/* <ConfirmDialog
                open={deleteState?.type === 'matReqOrder'}
                message="Это действие нельзя отменить."
                title="Удалить заявку на закуп?"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />

            <ConfirmDialog
                open={deleteState?.type === 'matReqOrderItem'}
                message="Это действие нельзя отменить."
                title="Удалить позицию из заявки на закуп?"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            /> */}
        </Paper>
    );
}
