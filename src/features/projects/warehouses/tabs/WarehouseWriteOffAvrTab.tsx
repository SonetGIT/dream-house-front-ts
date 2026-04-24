import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import MaterialWriteOffTable from '../materialWriteOffs/MaterialWriteOffTable';
import {
    fetchMaterialWriteOffs,
    signMaterialWriteOff,
    type MaterialWriteOff,
} from '../materialWriteOffs/materialWriteOffSlice';
import type { User } from '@/features/users/userSlice';

interface WarehouseWriteOffAvrTabProps {
    warehouseId: number;
    refs: Record<string, ReferenceResult>;
}

/**********************************************************************************************************************/
export default function WarehouseWriteOffAvrTab({
    warehouseId,
    refs,
}: WarehouseWriteOffAvrTabProps) {
    const dispatch = useAppDispatch();
    const { data, pagination, loading } = useAppSelector((state) => state.materialWriteOff);
    const currentUser = useAppSelector((state) => state.auth.user);

    const canSign = (writeOff: MaterialWriteOff, user?: User | null) => {
        if (!user) return false;

        const userId = Number(user.id);
        const roleId = Number(user.role_id);

        if (roleId === 1) {
            return !isFullyApproved(writeOff); // Администратор может подписать все этапы
        }

        switch (roleId) {
            // Руководитель
            case 2:
                return (
                    !writeOff.signed_by_general_director &&
                    (!writeOff.general_director_user_id ||
                        Number(writeOff.general_director_user_id) === userId)
                );

            // Прораб
            case 4:
                return (
                    !writeOff.signed_by_foreman &&
                    (!writeOff.foreman_user_id || Number(writeOff.foreman_user_id) === userId)
                );

            // Инженер ПТО
            case 10:
                return (
                    !writeOff.signed_by_planning_engineer &&
                    (!writeOff.planning_engineer_user_id ||
                        Number(writeOff.planning_engineer_user_id) === userId)
                );

            // Главный инженер
            case 11:
                return (
                    !writeOff.signed_by_main_engineer &&
                    (!writeOff.main_engineer_user_id ||
                        Number(writeOff.main_engineer_user_id) === userId)
                );

            default:
                return false;
        }
    };

    const isFullyApproved = (writeOff: MaterialWriteOff) => {
        return (
            !!writeOff.signed_by_foreman &&
            !!writeOff.signed_by_planning_engineer &&
            !!writeOff.signed_by_main_engineer &&
            !!writeOff.signed_by_general_director
        );
    };

    const getSignStage = (
        user?: User | null,
    ): 'foreman' | 'planning_engineer' | 'main_engineer' | 'general_director' | null => {
        if (!user) return null;

        const roleId = Number(user.role_id);

        if (roleId === 2) return 'general_director';
        if (roleId === 4) return 'foreman';
        if (roleId === 10) return 'planning_engineer';
        if (roleId === 11) return 'main_engineer';

        return null;
    };

    const refetchWriteOffs = async (
        page = pagination?.page ?? 1,
        size = pagination?.size ?? 10,
    ) => {
        await dispatch(
            fetchMaterialWriteOffs({
                warehouse_id: warehouseId,
                page,
                size,
            }),
        ).unwrap();
    };

    const handleSign = async (writeOff: MaterialWriteOff) => {
        if (!currentUser) {
            toast.error('У вас нет прав на подписание');
            return;
        }

        const roleId = Number(currentUser.role_id);

        try {
            // Администратор подписывает все неподписанные этапы
            if (roleId === 1) {
                const stages: Array<
                    'foreman' | 'planning_engineer' | 'main_engineer' | 'general_director'
                > = [];

                if (!writeOff.signed_by_foreman) {
                    stages.push('foreman');
                }

                if (!writeOff.signed_by_planning_engineer) {
                    stages.push('planning_engineer');
                }

                if (!writeOff.signed_by_main_engineer) {
                    stages.push('main_engineer');
                }

                if (!writeOff.signed_by_general_director) {
                    stages.push('general_director');
                }

                if (!stages.length) {
                    toast.success('Документ уже полностью подписан');
                    return;
                }

                for (const stage of stages) {
                    await dispatch(
                        signMaterialWriteOff({
                            id: writeOff.id,
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
                    signMaterialWriteOff({
                        id: writeOff.id,
                        stage,
                    }),
                ).unwrap();
            }

            toast.success('Списание по АВР подписано');
            await refetchWriteOffs();
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Ошибка подписания списания');
        }
    };

    /***********************************************************************************************************/
    return (
        <MaterialWriteOffTable
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
