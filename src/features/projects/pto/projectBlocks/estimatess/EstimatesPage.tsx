import { useCallback, useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    createEstimate,
    deleteEstimate,
    fetchEstimates,
    signEstimate,
    type Estimate,
} from './estimatesSlice';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { deleteEstimateItem, fetchEstimateItems } from './estimateItems/estimateItemsSlice';
import EstimatesTable from './EstimatesTable';
import type { User } from '@/features/users/userSlice';

interface Props {
    blockId: number;
    blockName: string;
}

/**********************************************************************************************************/
export default function EstimatesPage({ blockId, blockName }: Props) {
    const dispatch = useAppDispatch();
    const { data, loading, pagination, submitting } = useAppSelector((state) => state.estimates);
    const currentUser = useAppSelector((state) => state.auth.user);
    const page = 1;
    const size = 10;

    const [deleteState, setDeleteState] = useState<{
        type: 'estimate' | 'item';
        id: number;
    } | null>(null);

    //LOAD ESTIMATES
    useEffect(() => {
        if (!blockId) return;

        dispatch(
            fetchEstimates({
                block_id: blockId,
                page,
                size,
            }),
        );
    }, [blockId, page, size, dispatch]);

    //LOAD ESTIMATE ITEMS
    useEffect(() => {
        dispatch(fetchEstimateItems());
    }, [dispatch]);

    //DELETE
    const confirmDelete = useCallback(async () => {
        if (!deleteState) return;

        try {
            if (deleteState.type === 'item') {
                await dispatch(deleteEstimateItem(deleteState.id)).unwrap();
                toast.success('Позиция удалена');
            } else {
                await dispatch(deleteEstimate(deleteState.id)).unwrap();
                toast.success('Смета удалена');

                dispatch(
                    fetchEstimates({
                        block_id: blockId,
                        page,
                        size,
                    }),
                );
            }
        } catch {
            toast.error(`Ошибка удаления или у вас недостаточно прав на удаление`);
        } finally {
            setDeleteState(null);
        }
    }, [deleteState, dispatch, blockId, page, size]);

    const generateEstimateName = (blockName: string) => {
        return `Смета — ${blockName}`;
    };

    const isFullyApproved = (estimate: Estimate) => {
        return (
            !!estimate.signed_by_planning_engineer &&
            !!estimate.signed_by_main_engineer &&
            !!estimate.signed_by_general_director
        );
    };

    const canSign = (estimate: Estimate, user?: User | null) => {
        if (!user) return false;

        const userId = Number(user.id);
        const roleId = Number(user.role_id);

        if (roleId === 1) {
            return !isFullyApproved(estimate);
        }

        switch (roleId) {
            case 10:
                return (
                    !estimate.signed_by_planning_engineer &&
                    (!estimate.planning_engineer_user_id ||
                        Number(estimate.planning_engineer_user_id) === userId)
                );

            case 11:
                return (
                    !estimate.signed_by_main_engineer &&
                    (!estimate.main_engineer_user_id ||
                        Number(estimate.main_engineer_user_id) === userId)
                );

            case 2:
                return (
                    !estimate.signed_by_general_director &&
                    (!estimate.general_director_user_id ||
                        Number(estimate.general_director_user_id) === userId)
                );

            default:
                return false;
        }
    };

    const getSignStage = (
        user?: User | null,
    ): 'planning_engineer' | 'main_engineer' | 'general_director' | null => {
        if (!user) return null;

        const roleId = Number(user.role_id);

        if (roleId === 10) return 'planning_engineer';
        if (roleId === 11) return 'main_engineer';
        if (roleId === 2) return 'general_director';

        return null;
    };

    const refetchEstimates = useCallback(
        async (nextPage = pagination?.page ?? page, nextSize = pagination?.size ?? size) => {
            await dispatch(
                fetchEstimates({
                    block_id: blockId,
                    page: nextPage,
                    size: nextSize,
                }),
            ).unwrap();
        },
        [blockId, dispatch, page, pagination?.page, pagination?.size, size],
    );

    const handleSign = useCallback(
        async (estimate: Estimate) => {
            if (!currentUser) {
                toast.error('У вас нет прав на подписание');
                return;
            }

            const roleId = Number(currentUser.role_id);

            try {
                if (roleId === 1) {
                    const stages: Array<
                        'planning_engineer' | 'main_engineer' | 'general_director'
                    > = [];

                    if (!estimate.signed_by_planning_engineer) {
                        stages.push('planning_engineer');
                    }

                    if (!estimate.signed_by_main_engineer) {
                        stages.push('main_engineer');
                    }

                    if (!estimate.signed_by_general_director) {
                        stages.push('general_director');
                    }

                    if (!stages.length) {
                        toast.success('Смета уже полностью подписана');
                        return;
                    }

                    for (const stage of stages) {
                        await dispatch(signEstimate({ id: estimate.id, stage })).unwrap();
                    }
                } else {
                    const stage = getSignStage(currentUser);

                    if (!stage) {
                        toast.error('У вас нет прав на подписание');
                        return;
                    }

                    await dispatch(signEstimate({ id: estimate.id, stage })).unwrap();
                }

                toast.success('Смета подписана');
                await refetchEstimates();
            } catch (error: unknown) {
                toast.error(error instanceof Error ? error.message : 'Ошибка подписания сметы');
            }
        },
        [currentUser, dispatch, refetchEstimates],
    );

    //CREATE
    const handleCreateEstimate = useCallback(async () => {
        try {
            //Проверка: уже есть смета в этом блоке
            if (data.length > 0) {
                toast.error('В этом блоке уже существует смета');
                return;
            }

            const name = generateEstimateName(blockName);

            await dispatch(
                createEstimate({
                    block_id: blockId,
                    status: 1,
                    name,
                }),
            ).unwrap();

            toast.success('Смета создана');

            dispatch(
                fetchEstimates({
                    block_id: blockId,
                    page,
                    size,
                }),
            );
        } catch {
            toast.error('Ошибка создания сметы');
        }
    }, [dispatch, blockId, blockName, page, size, data]);

    /*************************************************************************************************************************/
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<Add />} onClick={handleCreateEstimate}>
                    Добавить смету
                </Button>
            </Box>

            {/* CONTENT */}
            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : data.length === 0 ? (
                <Typography color="text.secondary">Сметы отсутствуют</Typography>
            ) : (
                <>
                    <EstimatesTable
                        blockId={blockId}
                        data={data}
                        currentUser={currentUser}
                        canSign={canSign}
                        isFullyApproved={isFullyApproved}
                        onSign={handleSign}
                        signing={submitting}
                        onDeleteEstimateId={(id) => setDeleteState({ type: 'estimate', id })} // удалить смету
                        onDeleteEstimateItemId={(itemId: number) =>
                            setDeleteState({ type: 'item', id: itemId })
                        } // удалить позицию
                    />
                </>
            )}

            {/* DELETE CONFIRM */}
            <ConfirmDialog
                open={!!deleteState && deleteState.type === 'estimate'}
                title="Удалить смету?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />
            <ConfirmDialog
                open={!!deleteState && deleteState.type === 'item'}
                title="Удалить позицию?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />
        </Paper>
    );
}
