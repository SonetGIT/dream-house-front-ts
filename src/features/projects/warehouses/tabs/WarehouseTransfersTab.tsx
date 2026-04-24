import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { User } from '@/features/users/userSlice';
import { useEffect, useMemo } from 'react';
import WarehouseTransfersTable from '../warehouseTransfers/WarehouseTransfersTable';
import {
    fetchWarehouseTransfers,
    signWarehouseTransfer,
    type WarehouseTransfer,
} from '../warehouseTransfers/warehouseTransfersSlice';
import { useParams } from 'react-router-dom';

interface WarehouseTransfersTabProps {
    warehouseId: number;
    refs: Record<string, ReferenceResult>;
}

export default function WarehouseTransfersTab({ warehouseId, refs }: WarehouseTransfersTabProps) {
    const { projectId } = useParams();
    const dispatch = useAppDispatch();
    const { data, pagination, loading } = useAppSelector((state) => state.warehouseTransfers);
    const { items: projects } = useAppSelector((state) => state.projects);
    const { map: warehousesMap } = useAppSelector((state) => state.warehouses); // карта складов по ID
    const currentUser = useAppSelector((state) => state.auth.user);

    // Получаем master_id текущего проекта
    const masterId = useMemo(() => {
        const project = projects.find((p) => p.id === Number(projectId));
        return project?.master_id ?? null;
    }, [projects, projectId]);

    // Хелпер: получаем project_id склада по его ID
    const getProjectIdByWarehouseId = (warehouseId: number): number | null => {
        const warehouse = warehousesMap[warehouseId];
        return warehouse?.project_id ?? null;
    };

    //Хелпер: проверяет, принадлежит ли сторона перемещения текущему проекту
    // Поскольку в одном проекте только один склад — сравниваем project_id склада
    const isSideInCurrentProject = (
        whT: WarehouseTransfer,
        side: 'sender' | 'receiver',
        currentProjectId: number,
    ): boolean => {
        const warehouseId = side === 'sender' ? whT.from_warehouse_id : whT.to_warehouse_id;
        const projectOfSide = getProjectIdByWarehouseId(warehouseId);
        return projectOfSide === currentProjectId;
    };

    // Загрузка данных при монтировании
    useEffect(() => {
        dispatch(
            fetchWarehouseTransfers({
                warehouse_id: warehouseId,
                page: 1,
                size: pagination?.size ?? 10,
            }),
        );
    }, [dispatch, warehouseId]);

    /****************************************************************************/
    // Проверка: может ли пользователь подписать ЭТУ сторону документа
    const canSign = (
        whT: WarehouseTransfer,
        user?: User | null,
        currentWarehouseId?: number,
        currentProjectId?: number,
        currentMasterId?: number | null,
        preferredSide?: 'sender' | 'receiver',
    ) => {
        if (!user) return false;

        const userId = Number(user.id);
        const roleId = Number(user.role_id);

        // Админ (роль 1): может подписать любую неподписанную сторону
        if (roleId === 1) {
            if (preferredSide) {
                return (
                    (preferredSide === 'sender' && !whT.sender_signed) ||
                    (preferredSide === 'receiver' && !whT.receiver_signed)
                );
            }
            return !whT.sender_signed || !whT.receiver_signed;
        }

        // Кладовщик (роль 5): подписывает ТОЛЬКО свою сторону по складу
        if (roleId === 5) {
            if (currentWarehouseId === whT.from_warehouse_id) {
                return (
                    !whT.sender_signed &&
                    (!whT.sender_signed_user_id || Number(whT.sender_signed_user_id) === userId)
                );
            }
            if (currentWarehouseId === whT.to_warehouse_id) {
                return (
                    !whT.receiver_signed &&
                    (!whT.receiver_signed_user_id || Number(whT.receiver_signed_user_id) === userId)
                );
            }
            return false;
        }

        // Мастер (роль 15): подписывает ТОЛЬКО сторону, которая принадлежит ЕГО проекту
        // Поскольку в одном проекте только один склад:
        // - Мастер проекта А может подписать сторону, где склад из проекта А
        // - Не может подписать сторону, где склад из другого проекта
        if (roleId === 15) {
            // 1. Проверяем, что пользователь — назначенный мастер текущего проекта
            if (currentMasterId != null && userId !== currentMasterId) {
                return false;
            }

            // 2. Если указана preferredSide — проверяем только её
            if (preferredSide) {
                const isMySide = isSideInCurrentProject(whT, preferredSide, currentProjectId ?? 0);
                const isNotSigned =
                    preferredSide === 'sender' ? !whT.sender_signed : !whT.receiver_signed;
                return isMySide && isNotSigned;
            }

            // 3. Если preferredSide не указан — проверяем любую неподписанную сторону из его проекта
            const canSignSender =
                isSideInCurrentProject(whT, 'sender', currentProjectId ?? 0) && !whT.sender_signed;
            const canSignReceiver =
                isSideInCurrentProject(whT, 'receiver', currentProjectId ?? 0) &&
                !whT.receiver_signed;

            return canSignSender || canSignReceiver;
        }

        return false;
    };

    // Проверка: полностью ли подписан документ
    const isFullyApproved = (whT: WarehouseTransfer) => {
        return !!whT.sender_signed && !!whT.receiver_signed;
    };

    // Определение: какую сторону должен подписать пользователь
    const getSignStage = (
        user: User | null | undefined,
        whT: WarehouseTransfer,
        currentWarehouseId?: number,
        currentProjectId?: number,
        currentMasterId?: number | null,
        preferredSide?: 'sender' | 'receiver',
    ): 'sender' | 'receiver' | null => {
        if (!user) return null;

        const roleId = Number(user.role_id);
        const userId = Number(user.id);

        // Админ
        if (roleId === 1) {
            if (preferredSide && !whT[`${preferredSide}_signed` as keyof WarehouseTransfer]) {
                return preferredSide;
            }
            if (!whT.sender_signed) return 'sender';
            if (!whT.receiver_signed) return 'receiver';
            return null;
        }

        // Кладовщик
        if (roleId === 5) {
            if (currentWarehouseId === whT.from_warehouse_id) return 'sender';
            if (currentWarehouseId === whT.to_warehouse_id) return 'receiver';
            return null;
        }

        // Мастер: подписывает сторону, которая принадлежит ЕГО проекту
        if (roleId === 15) {
            // Проверяем, что пользователь — назначенный мастер
            if (currentMasterId != null && userId !== currentMasterId) {
                return null;
            }

            // Если указана preferredSide, проверяем только её
            if (preferredSide) {
                const isMySide = isSideInCurrentProject(whT, preferredSide, currentProjectId ?? 0);
                const isNotSigned = !whT[`${preferredSide}_signed` as keyof WarehouseTransfer];
                if (isMySide && isNotSigned) return preferredSide;
                return null;
            }

            // Иначе возвращаем первую неподписанную сторону из его проекта
            if (
                isSideInCurrentProject(whT, 'sender', currentProjectId ?? 0) &&
                !whT.sender_signed
            ) {
                return 'sender';
            }
            if (
                isSideInCurrentProject(whT, 'receiver', currentProjectId ?? 0) &&
                !whT.receiver_signed
            ) {
                return 'receiver';
            }
            return null;
        }

        return null;
    };

    // Перезагрузка списка
    const refetchTransfers = async (
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

    // Обработчик подписания (ОДНА сторона за клик)
    const handleSign = async (whT: WarehouseTransfer, preferredSide?: 'sender' | 'receiver') => {
        if (!currentUser) {
            toast.error('У вас нет прав на подписание');
            return;
        }

        const currentProjectId = Number(projectId);
        const currentMasterId = masterId;

        try {
            const side = getSignStage(
                currentUser,
                whT,
                warehouseId,
                currentProjectId,
                currentMasterId,
                preferredSide,
            );

            if (!side) {
                toast.success('Документ уже полностью подписан');
                return;
            }

            // Доп. проверка: не подписана ли уже эта сторона
            if (
                (side === 'sender' && whT.sender_signed) ||
                (side === 'receiver' && whT.receiver_signed)
            ) {
                toast.success('Эта сторона уже подписана');
                return;
            }

            await dispatch(
                signWarehouseTransfer({
                    id: whT.id,
                    side,
                }),
            ).unwrap();

            toast.success(`Подписано: ${side === 'sender' ? 'Отправитель' : 'Получатель'}`);
            await refetchTransfers();
        } catch (e: any) {
            console.error('Signing error:', e);
            toast.error(e?.message || 'Ошибка подписания перемещения');
        }
    };

    // Обёртка для передачи в таблицу (соответствует ожидаемой сигнатуре: 2 аргумента)
    const canSignWrapper = (whT: WarehouseTransfer, user?: User | null) => {
        return canSign(
            whT,
            user,
            warehouseId, // берём из замыкания
            Number(projectId), // берём из замыкания
            masterId, // берём из замыкания
        );
    };

    /*ОТКЛОНИТЬ*/
    // ✅ Проверка: можно ли отклонить документ (глобально)
    const canBeRejected = (whT: WarehouseTransfer): boolean => {
        // Нельзя отклонить, если ОБЕ стороны уже подписаны
        return !(whT.sender_signed && whT.receiver_signed);
    };

    // 🔐 Проверка: может ли пользователь отклонить ЭТУ сторону
    const canReject = (
        whT: WarehouseTransfer,
        user?: User | null,
        currentWarehouseId?: number,
        currentProjectId?: number,
        currentMasterId?: number | null,
        preferredSide?: 'sender' | 'receiver',
    ) => {
        // 1. Глобальная проверка: если документ полностью подписан — отклонять нельзя
        if (!canBeRejected(whT)) return false;

        if (!user) return false;

        const userId = Number(user.id);
        const roleId = Number(user.role_id);

        // 👑 Админ (роль 1): может отклонить любую неподписанную сторону
        if (roleId === 1) {
            if (preferredSide) {
                const isNotSigned =
                    preferredSide === 'sender' ? !whT.sender_signed : !whT.receiver_signed;
                return isNotSigned;
            }
            // Может отклонить, если есть хотя бы одна неподписанная сторона
            return !whT.sender_signed || !whT.receiver_signed;
        }

        // 📦 Кладовщик (роль 5): отклоняет ТОЛЬКО свою сторону по складу
        if (roleId === 5) {
            if (currentWarehouseId === whT.from_warehouse_id) {
                return !whT.sender_signed; // Может отклонить отправителя, если не подписан
            }
            if (currentWarehouseId === whT.to_warehouse_id) {
                return !whT.receiver_signed; // Может отклонить получателя, если не подписан
            }
            return false;
        }

        // 🔧 Мастер (роль 15): отклоняет ТОЛЬКО сторону из ЕГО проекта
        if (roleId === 15) {
            // Проверяем, что пользователь — назначенный мастер
            if (currentMasterId != null && userId !== currentMasterId) {
                return false;
            }

            if (preferredSide) {
                const isMySide = isSideInCurrentProject(whT, preferredSide, currentProjectId ?? 0);
                const isNotSigned =
                    preferredSide === 'sender' ? !whT.sender_signed : !whT.receiver_signed;
                return isMySide && isNotSigned;
            }

            // Проверяем любую сторону из его проекта
            const canRejectSender =
                isSideInCurrentProject(whT, 'sender', currentProjectId ?? 0) && !whT.sender_signed;
            const canRejectReceiver =
                isSideInCurrentProject(whT, 'receiver', currentProjectId ?? 0) &&
                !whT.receiver_signed;

            return canRejectSender || canRejectReceiver;
        }

        return false;
    };

    // 🎯 Определение: какую сторону должен отклонить пользователь
    const getRejectStage = (
        user: User | null | undefined,
        whT: WarehouseTransfer,
        currentWarehouseId?: number,
        currentProjectId?: number,
        currentMasterId?: number | null,
        preferredSide?: 'sender' | 'receiver',
    ): 'sender' | 'receiver' | null => {
        if (!user) return null;
        if (!canBeRejected(whT)) return null; // Документ завершён

        const roleId = Number(user.role_id);
        const userId = Number(user.id);

        // 👑 Админ
        if (roleId === 1) {
            if (preferredSide && !whT[`${preferredSide}_signed` as keyof WarehouseTransfer]) {
                return preferredSide;
            }
            if (!whT.sender_signed) return 'sender';
            if (!whT.receiver_signed) return 'receiver';
            return null;
        }

        // 📦 Кладовщик
        if (roleId === 5) {
            if (currentWarehouseId === whT.from_warehouse_id && !whT.sender_signed) return 'sender';
            if (currentWarehouseId === whT.to_warehouse_id && !whT.receiver_signed)
                return 'receiver';
            return null;
        }

        // 🔧 Мастер
        if (roleId === 15) {
            if (currentMasterId != null && userId !== currentMasterId) return null;

            if (preferredSide) {
                const isMySide = isSideInCurrentProject(whT, preferredSide, currentProjectId ?? 0);
                const isNotSigned = !whT[`${preferredSide}_signed` as keyof WarehouseTransfer];
                if (isMySide && isNotSigned) return preferredSide;
                return null;
            }

            if (isSideInCurrentProject(whT, 'sender', currentProjectId ?? 0) && !whT.sender_signed)
                return 'sender';
            if (
                isSideInCurrentProject(whT, 'receiver', currentProjectId ?? 0) &&
                !whT.receiver_signed
            )
                return 'receiver';
            return null;
        }

        return null;
    };

    // ✍️ Обработчик отклонения
    const handleReject = async (whT: WarehouseTransfer, preferredSide?: 'sender' | 'receiver') => {
        // Подтверждение действия
        const confirmed = window.confirm('Вы уверены, что хотите отклонить это перемещение?');
        if (!confirmed) return;

        if (!currentUser) {
            toast.error('У вас нет прав на отклонение');
            return;
        }

        const currentProjectId = Number(projectId);
        const currentMasterId = masterId;

        try {
            const side = getRejectStage(
                currentUser,
                whT,
                warehouseId,
                currentProjectId,
                currentMasterId,
                preferredSide,
            );

            if (!side) {
                toast.error('Нет сторон для отклонения или документ уже завершён');
                return;
            }

            await dispatch(
                signWarehouseTransfer({
                    id: whT.id,
                    side,
                }),
            ).unwrap();

            toast.success(`Отклонено: ${side === 'sender' ? 'Отправитель' : 'Получатель'}`);
            await refetchTransfers();
        } catch (e: any) {
            console.error('Reject error:', e);
            toast.error(e?.message || 'Ошибка отклонения перемещения');
        }
    };

    //Обёртка для таблицы (соответствует ожидаемой сигнатуре)
    const canRejectWrapper = (whT: WarehouseTransfer, user?: User | null) => {
        return canReject(whT, user, warehouseId, Number(projectId), masterId);
    };
    /******************************************************************************************************************************/
    return (
        <WarehouseTransfersTable
            data={data}
            refs={refs}
            pagination={pagination}
            loading={loading}
            currentUser={currentUser}
            canSign={canSignWrapper}
            canReject={canRejectWrapper}
            isFullyApproved={isFullyApproved}
            onSign={handleSign}
            onReject={handleReject}
            onPageChange={(newPage) => {
                refetchTransfers(newPage, pagination?.size ?? 10);
            }}
            onSizeChange={(newSize) => {
                refetchTransfers(1, newSize);
            }}
        />
    );
}
