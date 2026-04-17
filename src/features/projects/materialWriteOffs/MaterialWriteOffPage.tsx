import { useCallback, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/app/store';
import { useReference } from '@/features/reference/useReference';
import { TablePagination } from '@/components/ui/TablePagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';

import {
    createMaterialWriteOff,
    deleteMaterialWriteOff,
    fetchMaterialWriteOffs,
    updateMaterialWriteOff,
    type CreateMaterialWriteOffPayload,
    type MaterialWriteOff,
    type UpdateMaterialWriteOffPayload,
} from './materialWriteOffSlice';
import MaterialWriteOffTable from './MaterialWriteOffTable';
import MaterialWriteOffModal from './MaterialWriteOffModal';
import { FolderOpen, MinusCircle } from 'lucide-react';

/*****************************************************************************************************************************/
export default function MaterialWriteOffPage() {
    const dispatch = useAppDispatch();

    const { projectId, prjBlockId } = useParams();
    const projectIdNum = projectId ? Number(projectId) : null;
    const blockId = prjBlockId ? Number(prjBlockId) : null;

    const { data, pagination, loading, submitting } = useAppSelector(
        (state) => state.materialWriteOff,
    );

    const currentUser = useAppSelector((state) => state.auth.user);

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [modal, setModal] = useState<'create' | 'edit' | null>(null);
    const [editingItem, setEditingItem] = useState<MaterialWriteOff | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const prjBlocks = useReference('projectBlocks');
    const users = useReference('users');
    const warehouses = useReference('warehouses');
    const materials = useReference('materials');
    const unitsOfMeasure = useReference('unitsOfMeasure');
    const materialWriteOffStatuses = useReference('materialWriteOffStatuses');

    const refs = {
        prjBlocks,
        users,
        warehouses,
        materials,
        unitsOfMeasure,
        materialWriteOffStatuses,
    };

    const loadMaterialWriteOffs = useCallback(() => {
        if (!projectIdNum || !blockId) return;

        dispatch(
            fetchMaterialWriteOffs({
                project_id: projectIdNum,
                block_id: blockId,
                // warehouse_id: 5,
                // work_performed_id: 34,
                // work_performed_item_id: 38,
                // status: 0,
                page,
                size,
            }),
        );
    }, [dispatch, projectIdNum, blockId, page, size]);

    useEffect(() => {
        loadMaterialWriteOffs();
    }, [loadMaterialWriteOffs]);

    const handleCreate = () => {
        setEditingItem(null);
        setModal('create');
    };

    const handleEdit = (item: MaterialWriteOff) => {
        setEditingItem(item);
        setModal('edit');
    };

    const handleCloseModal = () => {
        setModal(null);
        setEditingItem(null);
    };

    const handleSubmit = async (
        payload: CreateMaterialWriteOffPayload | UpdateMaterialWriteOffPayload,
        id?: number,
    ) => {
        try {
            if (id) {
                await dispatch(
                    updateMaterialWriteOff({
                        id,
                        data: payload as UpdateMaterialWriteOffPayload,
                    }),
                ).unwrap();

                toast.success('Списание материалов обновлено');
            } else {
                await dispatch(
                    createMaterialWriteOff(payload as CreateMaterialWriteOffPayload),
                ).unwrap();

                toast.success('Списание материалов создано');
            }

            handleCloseModal();
            loadMaterialWriteOffs();
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Ошибка сохранения списания материалов');
        }
    };

    const confirmDelete = useCallback(async () => {
        if (!deleteId) return;

        try {
            await dispatch(deleteMaterialWriteOff(deleteId)).unwrap();

            toast.success('Списание материалов удалено');
            setDeleteId(null);

            loadMaterialWriteOffs();
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Ошибка удаления списания материалов');
        }
    }, [deleteId, dispatch, loadMaterialWriteOffs]);

    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<MinusCircle />} onClick={handleCreate}>
                    Списание
                </Button>
            </Box>

            {/* CONTENT */}
            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : data?.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                        <FolderOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="mb-1 text-base font-medium text-gray-900">
                        Списанные материалы отсутствуют
                    </h3>
                </div>
            ) : (
                <>
                    <MaterialWriteOffTable
                        data={data}
                        refs={refs}
                        onEdit={handleEdit}
                        onDelete={(id) => setDeleteId(id)}
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
                size="full"
                isOpen={modal === 'create' || modal === 'edit'}
                onClose={handleCloseModal}
                title={modal === 'edit' ? 'Редактировать списание' : 'Создать списание'}
            >
                <MaterialWriteOffModal
                    open={modal === 'create' || modal === 'edit'}
                    initialData={editingItem}
                    projectId={Number(projectIdNum)}
                    blockId={Number(blockId)}
                    currentUserId={Number(currentUser?.id || 0)}
                    refs={refs}
                    submitting={submitting}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
                />
            </Modal>

            {/* DELETE CONFIRM */}
            <ConfirmDialog
                open={Boolean(deleteId)}
                title="Удалить списание материалов?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </Paper>
    );
}
