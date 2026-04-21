import Modal from '@/components/ui/Modal';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { Warehouse } from './warehousesSlice';
import type {
    PurchaseOrderItem,
    ReceivePurchaseOrderItemPayload,
} from '../purchaseOrderItems/purchaseOrderItemsSlice';
import PurchaseOrderItemsReceiveTable from './PurchaseOrderItemsReceiveTable';

interface WarehouseReceiveModalProps {
    warehouse: Warehouse | null;
    items: PurchaseOrderItem[];
    refs: Record<string, ReferenceResult>;
    loading: boolean;
    onClose: () => void;
    onSubmit: (items: ReceivePurchaseOrderItemPayload[]) => void;
}

// Прием товара
/**********************************************************************************************************************/
export default function WarehouseReceiveModal({
    warehouse,
    items,
    refs,
    loading,
    onClose,
    onSubmit,
}: WarehouseReceiveModalProps) {
    return (
        <Modal
            size="full"
            isOpen={Boolean(warehouse)}
            onClose={onClose}
            title="Список материалов подтверждённых поставщиком"
        >
            <PurchaseOrderItemsReceiveTable
                items={items}
                refs={refs}
                loading={loading}
                onCancel={onClose}
                onSubmit={onSubmit}
            />
        </Modal>
    );
}
