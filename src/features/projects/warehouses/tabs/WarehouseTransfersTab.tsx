import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { User } from '@/features/users/userSlice';
import { useEffect } from 'react';
import WarehouseTransfersTable from '../warehouseTransfers/WarehouseTransfersTable';
import {
    fetchWarehouseTransfers,
    signWarehouseTransfer,
    type WarehouseTransfer,
} from '../warehouseTransfers/warehouseTransfersSlice';

interface WarehouseTransfersTabProps {
    warehouseId: number;
    refs: Record<string, ReferenceResult>;
}

export default function WarehouseTransfersTab({ warehouseId, refs }: WarehouseTransfersTabProps) {
    const dispatch = useAppDispatch();
    const { data, pagination, loading } = useAppSelector((state) => state.warehouseTransfers);
    const currentUser = useAppSelector((state) => state.auth.user);

    useEffect(() => {
        dispatch(
            fetchWarehouseTransfers({
                warehouse_id: warehouseId,
                page: 1,
                size: pagination?.size ?? 10,
            }),
        );
    }, [dispatch, warehouseId]);

    const canSign = (whT: WarehouseTransfer, user?: User | null) => {
        if (!user) return false;

        const userId = Number(user.id);
        const roleId = Number(user.role_id);

        if (roleId === 1) {
            return !isFullyApproved(whT); // Администратор может подписать все этапы
        }

        switch (roleId) {
            // Отправитель
            case 2:
                return (
                    !whT.sender_signed &&
                    (!whT.sender_signed_user_id || Number(whT.sender_signed_user_id) === userId)
                );

            //Принимал
            case 4:
                return (
                    !whT.receiver_signed &&
                    (!whT.receiver_signed_user_id || Number(whT.receiver_signed_user_id) === userId)
                );
            default:
                return false;
        }
    };

    const isFullyApproved = (whT: WarehouseTransfer) => {
        return !!whT.sender_signed && !!whT.receiver_signed;
    };

    const getSignStage = (user?: User | null): 'sender' | 'receiver' | null => {
        if (!user) return null;

        const roleId = Number(user.role_id);

        // if (roleId === 2) return 'sender';
        // if (roleId === 4) return 'receiver';

        return null;
    };

    const refetchWriteOffs = async (
        page = pagination?.page ?? 1,
        size = pagination?.size ?? 10,
    ) => {
        await dispatch(
            fetchWarehouseTransfers({
                warehouse_id: warehouseId,
                page,
                size,
            }),
        ).unwrap();
    };

    const handleSign = async (whT: WarehouseTransfer) => {
        if (!currentUser) {
            toast.error('У вас нет прав на подписание');
            return;
        }

        const roleId = Number(currentUser.role_id);

        try {
            if (roleId === 1) {
                const stages: Array<'sender' | 'receiver'> = [];

                if (!whT.sender_signed) stages.push('sender');
                if (!whT.receiver_signed) stages.push('receiver');

                if (!stages.length) {
                    toast.success('Документ уже полностью подписан');
                    return;
                }

                for (const stage of stages) {
                    await dispatch(
                        signWarehouseTransfer({
                            id: whT.id,
                            stage,
                        }),
                    ).unwrap();
                }
            } else {
                const stage = getSignStage(currentUser);

                if (!stage) {
                    toast.error('У вас нет прав на подписание');
                    return;
                }

                await dispatch(
                    signWarehouseTransfer({
                        id: whT.id,
                        stage,
                    }),
                ).unwrap();
            }

            toast.success('Накладная по перемещении подписано');
            await refetchWriteOffs();
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Ошибка подписания накладной по перемещении');
        }
    };

    return (
        <WarehouseTransfersTable
            data={data}
            refs={refs}
            pagination={pagination}
            loading={loading}
            currentUser={currentUser}
            canSign={canSign}
            isFullyApproved={isFullyApproved}
            onSign={handleSign}
            onPageChange={(newPage) => {
                refetchWriteOffs(newPage, pagination?.size ?? 10);
            }}
            onSizeChange={(newSize) => {
                refetchWriteOffs(1, newSize);
            }}
        />
    );
}
