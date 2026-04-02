import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import toast from 'react-hot-toast';
import { TablePagination } from '@/components/ui/TablePagination';
import { useReference } from '@/features/reference/useReference';
import { getProjectById } from '../a_project/projectsSlice';
import { Add } from '@mui/icons-material';
import {
    deleteMaterialRequestItem,
    fetchMaterialRequestItems,
} from '../material_request_items/materialRequestItemsSlice';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import { calcRowTotal } from '@/utils/calcRowTotal';
import { fetchProjectBlocks } from '../pto/projectBlocks/projectBlocksSlice';
import {
    createPurchaseOrder,
    deletePurchaseOrder,
    fetchPurchaseOrders,
} from './purchaseOrdersSlice';
import { deletePurchaseOrderItem } from '../purchaseOrderItems/purchaseOrderItemsSlice';
import PurchaseOrdersTable from './PurchaseOrdersTable';
import { FolderOpen } from 'lucide-react';
import PurchaseItemsSelector from '../purchaseOrderItems/PurchaseItemsSelector';

/*************************************************************************************************************************/
export default function PurchaseOrdersPage() {
    const dispatch = useAppDispatch();
    const { projectId, prjBlockId } = useParams();
    const projectIdNum = projectId ? Number(projectId) : null;
    const blockId = prjBlockId ? Number(prjBlockId) : null;
    console.log(projectIdNum, blockId);
    const {
        data: purchaseOrders,
        loading: purchaseOrdersLoading,
        pagination: purchaseOrdersPagination,
    } = useAppSelector((state) => state.purchaseOrders);

    const { items: materialRequestItems } = useAppSelector((state) => state.materialRequestItems);
    console.log('materialRequestItems', materialRequestItems);
    console.log('purchaseOrders', purchaseOrders);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [modal, setModal] = useState<'create' | 'edit' | 'delete' | null>(null);

    const [deleteState, setDeleteState] = useState<{
        type: 'matReqOrder' | 'matReqOrderItem';
        id: number;
    } | null>(null);

    // hooks всегда вызываются одинаково
    const purchaseOrderStatuses = useReference('purchaseOrderStatuses');
    const prjBlocks = useReference('projectBlocks');
    //

    const refs = {
        purchaseOrderStatuses,
        prjBlocks,
    };

    //заявка на закупку - purchase order
    useEffect(() => {
        if (projectId && blockId) {
            dispatch(
                fetchPurchaseOrders({ project_id: projectIdNum, block_id: blockId, page, size }),
            );
        }
    }, [projectId, blockId, page, size]);

    //заявка на закупку - purchase order
    const { items: materialRequestItems } = useAppSelector((state) => state.materialRequestItems);
    useEffect(() => {
        if (projectId && blockId) {
            dispatch(fetchMaterialRequestItems({ status: Number(2) })); //одобрено
        }
    }, [projectId, blockId, page, size]);
    console.log('materialRequestItems', materialRequestItems);

    //HANDLERS
    const handleCreate = () => {
        setModal('create');
    };

    const confirmDelete = useCallback(async () => {
        if (!deleteState) return;

        try {
            if (deleteState.type === 'matReqOrder') {
                await dispatch(deletePurchaseOrder(deleteState.id)).unwrap();
                toast.success('Заявка на закупку удалена');
            } else {
                await dispatch(deletePurchaseOrderItem(deleteState.id)).unwrap();
                toast.success('Позиция заявки на закупку удалена');

                if (projectIdNum) {
                    dispatch(
                        fetchPurchaseOrders({
                            project_id: projectIdNum,
                            block_id: blockId,
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

    //RENDER
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<Add />} onClick={handleCreate}>
                    Создать заявку на закуп
                </Button>
            </Box>

            {/* CONTENT */}
            {purchaseOrdersLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : purchaseOrders.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                        <FolderOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="mb-1 text-base font-medium text-gray-900">
                        Заявки на закуп отсутствуют. Добавьте заявку нажав на кнопку "Создать заявку
                        на закуп".
                    </h3>
                </div>
            ) : (
                <>
                    <PurchaseOrdersTable
                        data={purchaseOrders}
                        refs={refs}
                        onDeleteMatReqOrderId={(id) => setDeleteState({ type: 'matReqOrder', id })}
                        onDeleteMatReqOrderItemId={(itemId) =>
                            setDeleteState({ type: 'matReqOrderItem', id: itemId })
                        }
                    />
                    {purchaseOrdersPagination && (
                        <TablePagination
                            pagination={purchaseOrdersPagination}
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
                // size={step === 'estimate' || step === 'form' ? 'full' : 'xl'}
                isOpen={modal === 'create'}
                onClose={() => setModal(null)}
                title="Создать новую заявку на закуп"
            >
                <PurchaseItemsSelector
                    items={materialRequestItems}
                    // onSubmit={(rows) => {
                    //     dispatch(
                    //         createPurchaseOrder({
                    //             project_id,
                    //             block_id,
                    //             status: 1,
                    //             items: rows.map((r) => ({
                    //                 material_request_item_id: r.id,
                    //                 material_id: r.material_id,
                    //                 quantity: r.quantity,
                    //                 price: r.price,
                    //                 currency: r.currency,
                    //                 currency_rate: r.currency_rate,
                    //                 supplier_id: r.supplier_id,
                    //             })),
                    //         }),
                    //     );
                    // }}
                />
            </Modal>

            {/* DELETE CONFIRM */}
            <ConfirmDialog
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
            />
        </Paper>
    );
}
