import type { ReferenceResult } from '@/features/reference/referenceSlice';

interface Props {
    warehouseId: number;
    refs: Record<string, ReferenceResult>;
}

export default function WarehouseWriteOffMpbTab({ warehouseId }: Props) {
    return (
        <div className="p-6 text-sm text-center text-gray-400 bg-white border rounded-lg">
            Списание МПБ пока не реализовано. Склад №{warehouseId}
        </div>
    );
}
