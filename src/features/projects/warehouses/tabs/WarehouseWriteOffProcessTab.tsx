import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { User } from '@/features/users/userSlice';
import {
    fetchProcessingWriteOffs,
    signProcessingWriteOff,
    type ProcessingWriteOff,
} from '../materialProcessingWriteOffs/processingWriteOffSlice';
import ProcessingWriteOffTable from '../materialProcessingWriteOffs/ProcessingWriteOffTable';
import { useEffect } from 'react';

interface WarehouseWriteOffProcessingTabProps {
    warehouseId: number;
    refs: Record<string, ReferenceResult>;
}

export default function WarehouseWriteOffProcessTab({
    warehouseId,
    refs,
}: WarehouseWriteOffProcessingTabProps) {
    const dispatch = useAppDispatch();
    const { data, pagination, loading } = useAppSelector((state) => state.processingWriteOff);
    const currentUser = useAppSelector((state) => state.auth.user);

    useEffect(() => {
        dispatch(
            fetchProcessingWriteOffs({
                warehouse_id: warehouseId,
                page: 1,
                size: pagination?.size ?? 10,
            }),
        );
    }, [dispatch, warehouseId]);

    const canSign = (writeOff: ProcessingWriteOff, user?: User | null) => {
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

    const isFullyApproved = (writeOff: ProcessingWriteOff) => {
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
            fetchProcessingWriteOffs({
                warehouse_id: warehouseId,
                page,
                size,
            }),
        ).unwrap();
    };

    const handleSign = async (writeOff: ProcessingWriteOff) => {
        if (!currentUser) {
            toast.error('У вас нет прав на подписание');
            return;
        }

        const roleId = Number(currentUser.role_id);

        try {
            if (roleId === 1) {
                const stages: Array<
                    'foreman' | 'planning_engineer' | 'main_engineer' | 'general_director'
                > = [];

                if (!writeOff.signed_by_foreman) stages.push('foreman');
                if (!writeOff.signed_by_planning_engineer) stages.push('planning_engineer');
                if (!writeOff.signed_by_main_engineer) stages.push('main_engineer');
                if (!writeOff.signed_by_general_director) stages.push('general_director');

                if (!stages.length) {
                    toast.success('Документ уже полностью подписан');
                    return;
                }

                for (const stage of stages) {
                    await dispatch(
                        signProcessingWriteOff({
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
                    signProcessingWriteOff({
                        id: writeOff.id,
                        stage,
                    }),
                ).unwrap();
            }

            toast.success('Списание по переработке подписано');
            await refetchWriteOffs();
        } catch (e: any) {
            console.error(e);
            toast.error(e?.message || 'Ошибка подписания списания по переработке');
        }
    };

    return (
        <ProcessingWriteOffTable
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
