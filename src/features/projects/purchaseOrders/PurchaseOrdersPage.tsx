import { Box, Button, CircularProgress, Paper } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import toast from 'react-hot-toast';
import { TablePagination } from '@/components/ui/TablePagination';
import { useReference } from '@/features/reference/useReference';
import { Add } from '@mui/icons-material';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import {
    createPurchaseOrder,
    deletePurchaseOrder,
    fetchPurchaseOrders,
    type CreatePurchaseOrderPayload,
} from './purchaseOrdersSlice';
import {
    deletePurchaseOrderItem,
    updatePurchaseOrderItem,
} from '../purchaseOrderItems/purchaseOrderItemsSlice';
import PurchaseOrdersTable from './PurchaseOrdersTable';
import { FolderOpen } from 'lucide-react';
import {
    clearMaterialRequests,
    fetchSearchMaterialReq,
} from '../material_request/materialRequestsSlice';
import MatReqItemsSelectTable, { type EditableItem } from './MatReqItemsSelectTable';

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

    const { data } = useAppSelector((state) => state.materialRequests);
    const user = useAppSelector((state) => state.auth.user);
    const filteredItems = data?.filter((req) => req.status === 2).flatMap((req) => req.items) || [];

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
    const materials = useReference('materials');
    const unitsOfMeasure = useReference('unitsOfMeasure');
    const currencies = useReference('currencies');
    const supplierRating = useReference('supplierRating');
    const purchaseOrderItemStatuses = useReference('purchaseOrderItemStatuses');

    const refs = {
        purchaseOrderStatuses,
        prjBlocks,
        materials,
        unitsOfMeasure,
        currencies,
        supplierRating,
        purchaseOrderItemStatuses,
    };

    //заявка на закупку - purchase order
    useEffect(() => {
        if (projectIdNum && blockId) {
            dispatch(
                fetchPurchaseOrders({ project_id: projectIdNum, block_id: blockId, page, size }),
            );
        }
    }, [projectIdNum, blockId, page, size]);

    //загрузка заявок на материалы для селектора при создании заявки на закупку
    useEffect(() => {
        if (projectIdNum && blockId) {
            dispatch(clearMaterialRequests());

            dispatch(
                fetchSearchMaterialReq({
                    page,
                    size,
                    block_id: blockId,
                    project_id: projectIdNum,
                }),
            );
        }
    }, [projectIdNum, blockId, dispatch]);

    //HANDLERS
    const handleCreate = () => {
        setModal('create');
    };

    //создание заявки на закупку на основе одобренных заявок на материалы
    const handleCreatePurchaseOrder = async (items: EditableItem[]) => {
        try {
            const payload: CreatePurchaseOrderPayload = {
                project_id: projectIdNum!,
                block_id: blockId!,
                status: 1, //'Отправлен поставщику'
                created_user_id: user?.id || 0,
                items: items.map((item) => ({
                    material_request_item_id: item.id,
                    material_type: item.material_type,
                    material_id: item.material_id,
                    quantity: Number(item.quantity) || 0,
                    unit_of_measure: item.unit_of_measure,
                    currency: item.currency,
                    currency_rate: Number(item.currency_rate) || 1,
                    price: Number(item.price) || 0,
                    summ:
                        (Number(item.quantity) || 0) *
                        (Number(item.price) || 0) *
                        (Number(item.currency_rate) || 1),
                    supplier_id: item.supplier_id ?? item.supplier_id,
                })),
            };
            console.log('payload', payload);
            await dispatch(createPurchaseOrder(payload)).unwrap();

            toast.success('Заявка на закупку создана');
            setModal(null);

            if (projectIdNum && blockId) {
                dispatch(
                    fetchPurchaseOrders({
                        project_id: projectIdNum,
                        block_id: blockId,
                        page,
                        size,
                    }),
                );
            }
        } catch (e) {
            console.error(e);
            toast.error('Ошибка при создании заявки на закупку');
        }
    };

    const changePurchaseOrderItemStatus = async (id: number, status: 2 | 3) => {
        try {
            await dispatch(
                updatePurchaseOrderItem({
                    id,
                    data: { status },
                }),
            ).unwrap();

            toast.success(
                status === 2
                    ? 'Позиция переведена в статус "Подтверждён поставщиком"'
                    : 'Позиция переведена в статус "Отменён (нет у поставщика)"',
            );

            if (projectIdNum && blockId) {
                dispatch(
                    fetchPurchaseOrders({
                        project_id: projectIdNum,
                        block_id: blockId,
                        page,
                        size,
                    }),
                );
            }
        } catch (e) {
            console.error(e);
            toast.error('Не удалось изменить статус позиции');
        }
    };

    const onForDelivery = (id: number) => changePurchaseOrderItemStatus(id, 2); //Подтверждён поставщиком
    const onRefusalToDeliver = (id: number) => changePurchaseOrderItemStatus(id, 3); //Отменён (нет у поставщика)

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
                        onForDelivery={onForDelivery}
                        onRefusalToDeliver={onRefusalToDeliver}
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
