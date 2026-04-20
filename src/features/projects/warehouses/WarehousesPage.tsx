import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useReference } from '../../reference/useReference';
import {
    createWarehouse,
    deleteWarehouse,
    fetchWarehouses,
    updateWarehouse,
    type Warehouse,
    type WarehouseFormData,
} from './warehousesSlice';
import { useOutletContext } from 'react-router-dom';
import type { ProjectOutletContext } from '../pto/PtoPage';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Box, Button, CircularProgress, Paper } from '@mui/material';
import { CheckCircle2, FolderOpen, TrendingUp, XCircle } from 'lucide-react';
import { Add } from '@mui/icons-material';
import { TablePagination } from '@/components/ui/TablePagination';
import toast from 'react-hot-toast';
import { deleteWarehouseItem } from '../warehouseStocks/warehouseStocksSlice';
import { WarehouseForm } from './WarehouseForm';
import WarehousesTable from './WarehousesTable';

/*******************************************************************************************************************************************************************/
export default function WarehousesPage() {
    const { projectId } = useOutletContext<ProjectOutletContext>();
    const projectIdNum = projectId ? Number(projectId) : null;
    const dispatch = useAppDispatch();
    const { data, pagination, loading } = useAppSelector((state) => state.warehouses);

    const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [deleteState, setDeleteState] = useState<{
        type: 'warehouse' | 'warehouseItem';
        id: number;
    } | null>(null);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);

    const emptyWarehouses = data.filter((w: Warehouse) => !w.items?.length).length;
    const filledWarehouses = data.filter((w: Warehouse) => w.items && w.items.length > 0).length;
    const fillPercent = data.length > 0 ? Math.round((filledWarehouses / data.length) * 100) : 0;

    // Справочники
    const refs = {
        warehouses: useReference('warehouses'),
        users: useReference('users'),
        materials: useReference('materials'),
        materialTypes: useReference('materialTypes'),
        unitsOfMeasure: useReference('unitsOfMeasure'),
        materialWriteOffStatuses: useReference('materialWriteOffStatuses'),
        projectBlocks: useReference('projectBlocks'),
        services: useReference('services'),
        serviceTypes: useReference('serviceTypes'),
        materialMovementStatuses: useReference('materialMovementStatuses'),
    };

    //Первичная загрузка =====
    useEffect(() => {
        dispatch(fetchWarehouses({ page, size, project_id: projectId }));
    }, [projectId, page, size]);

    const handleCreate = () => {
        setSelectedWarehouse(null);
        setModal('create');
    };

    const handleEdit = (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        setModal('edit');
    };

    const refetchWHouse = (page = pagination?.page ?? 1, size = pagination?.size ?? 10) => {
        dispatch(
            fetchWarehouses({
                project_id: projectId,
                page,
                size,
                // ...filters,
            }),
        );
    };

    const handleCreateWhouse = async (data: WarehouseFormData) => {
        try {
            setFormLoading(true);

            await dispatch(createWarehouse({ project_id: projectId, data })).unwrap();

            toast.success(`Склад успешно создан: ${data.name}`);

            refetchWHouse(1); //всегда на первую страницу

            setModal(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка создания склада');
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateWhouse = async (data: WarehouseFormData) => {
        if (!selectedWarehouse) return;

        try {
            setFormLoading(true);

            await dispatch(
                updateWarehouse({
                    id: selectedWarehouse.id,
                    data,
                }),
            ).unwrap();

            toast.success(`Данные склада обновлены: ${data.name}`);

            refetchWHouse(); //остаёмся на текущей странице

            setModal(null);
            setSelectedWarehouse(null);
        } catch (err: any) {
            toast.error(err || 'Ошибка обновления данных склада');
        } finally {
            setFormLoading(false);
        }
    };

    /* удаление */
    const confirmDelete = useCallback(async () => {
        if (!deleteState) return;

        try {
            if (deleteState.type === 'warehouse') {
                await dispatch(deleteWarehouse(deleteState.id)).unwrap();
                toast.success('Склад удален');
            } else {
                await dispatch(deleteWarehouseItem(deleteState.id)).unwrap();
                toast.success('Позиция из склада удалена');

                if (projectIdNum) {
                    dispatch(
                        fetchWarehouses({
                            project_id: projectIdNum,
                            page,
                            size,
                        }),
                    );
                }
            }
        } catch {
            toast.error('Ошибка удаления, проверьте права доступа на удаления');
        } finally {
            setDeleteState(null);
        }
    }, [deleteState, dispatch, projectIdNum]);

    /********************************************************************************************************************************************/
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<Add />} onClick={handleCreate}>
                    Добавить склад
                </Button>
            </Box>

            {/* <div className="flex items-center gap-6 mb-6 text-sm">
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
            </div> */}
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
                        onEdit={handleEdit}
                        // onDeleteWarehouseId={(id) => setDeleteState({ type: 'warehouse', id })}
                        // onDeleteWHouseItemId={(itemId) =>
                        //     setDeleteState({ type: 'warehouseItem', id: itemId })
                        // }
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
                isOpen={modal === 'create'}
                onClose={() => setModal(null)}
                title="Создать новый склад"
            >
                <WarehouseForm
                    refs={refs}
                    onSubmit={handleCreateWhouse}
                    onCancel={() => setModal(null)}
                    isLoading={loading}
                />
            </Modal>

            {/* EDIT */}
            <Modal
                isOpen={modal === 'edit'}
                onClose={() => setModal(null)}
                title="Редактировать данные склада"
            >
                <WarehouseForm
                    warehouse={selectedWarehouse}
                    refs={refs}
                    onSubmit={handleUpdateWhouse}
                    onCancel={() => setModal(null)}
                    isLoading={formLoading}
                />
            </Modal>

            {/* DELETE CONFIRM */}
            <ConfirmDialog
                open={deleteState?.type === 'warehouse'}
                message="Это действие нельзя отменить."
                title="Удалить склад?"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />

            <ConfirmDialog
                open={deleteState?.type === 'warehouseItem'}
                message="Это действие нельзя отменить."
                title="Удалить позицию из склада?"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />
        </Paper>
    );
}
