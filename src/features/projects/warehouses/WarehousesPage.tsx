import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useReference } from '../../reference/useReference';
import {
    createWarehouse,
    fetchWarehouses,
    updateWarehouse,
    type Warehouse,
    type WarehouseFormData,
} from './warehousesSlice';
import { useOutletContext } from 'react-router-dom';
import type { ProjectOutletContext } from '../pto/PtoPage';
import Modal from '@/components/ui/Modal';
import { Box, Button, CircularProgress, Paper } from '@mui/material';
import { FolderOpen } from 'lucide-react';
import { Add } from '@mui/icons-material';
import { TablePagination } from '@/components/ui/TablePagination';
import toast from 'react-hot-toast';
import { WarehouseCreateForm } from './WarehouseCreateForm';
import WarehousesTable from './WarehousesTable';
import { WarehouseStatsPanel } from './WarehouseStatsPanel';

/*******************************************************************************************************************************************************************/
export default function WarehousesPage() {
    const { projectId } = useOutletContext<ProjectOutletContext>();
    const dispatch = useAppDispatch();
    const { data, pagination, loading } = useAppSelector((state) => state.warehouses);

    const currentWarehouse = data.find((w) => w.project_id === projectId)!;

    const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);

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

    /********************************************************************************************************************************************/
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<Add />} onClick={handleCreate}>
                    Добавить склад
                </Button>
            </Box>

            <WarehouseStatsPanel warehouse={currentWarehouse} />
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
                        projectId={projectId}
                        data={data}
                        refs={refs}
                        onEdit={handleEdit}
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
                <WarehouseCreateForm
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
                <WarehouseCreateForm
                    warehouse={selectedWarehouse}
                    refs={refs}
                    onSubmit={handleUpdateWhouse}
                    onCancel={() => setModal(null)}
                    isLoading={formLoading}
                />
            </Modal>
        </Paper>
    );
}
