import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { Button, CircularProgress, Paper, Typography } from '@mui/material';
import { Box } from '@mui/material';
import { Add } from '@mui/icons-material';
import toast from 'react-hot-toast';

import {
    createBlockStage,
    updateBlockStage,
    deleteBlockStage,
    fetchBlockStages,
    type BlockStage,
} from './blockStagesSlice';

import BlockStagesTable from './BlockStagesTable';
import BlockStageModal from './BlockStageModal';

import { deleteStageSubsection } from './subStages/stageSubsectionsSlice';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Layers, List } from 'lucide-react';
import { fetchEnum } from '@/features/reference/referenceSlice';

/*ЭТАПЫ - БЛОКА************************************************************************************************************/
export default function BlockStagesPage({ blockId }: { blockId: number }) {
    const dispatch = useAppDispatch();

    const allStages = useAppSelector((s) => s.blockStages.data);
    const subStagesByStageId = useAppSelector((s) => s.stageSubsections.byStageId);
    const loading = useAppSelector((s) => s.blockStages.loading);

    const stages = useMemo(() => {
        return allStages.filter((st) => st.block_id === blockId);
    }, [allStages, blockId]);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const size = 10;
    const [editingStage, setEditingStage] = useState<BlockStage | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
    });

    const [deleteState, setDeleteState] = useState<
        { type: 'stage'; id: number } | { type: 'subStage'; id: number; stageId: number } | null
    >(null);

    /* статистика по этапам и подэтапам */
    const totalStages = stages.length;

    const totalSubStages = stages.reduce((sum, stage) => {
        const subStages = subStagesByStageId[stage.id] ?? [];
        return sum + subStages.length;
    }, 0);

    /* загрузка этапов */
    useEffect(() => {
        if (!blockId) return;

        dispatch(
            fetchBlockStages({
                block_id: blockId,
                page,
                size,
            }),
        );
    }, [dispatch, blockId, page]);

    /* фильтр поиска */
    const filteredStages = useMemo(() => {
        return stages.filter((stage) => stage.name.toLowerCase().includes(search.toLowerCase()));
    }, [stages, search]);

    /* создание этапа */
    const handleCreateStage = () => {
        setEditingStage(null);

        setFormData({
            name: '',
            start_date: '',
            end_date: '',
        });

        setModalOpen(true);
    };

    /* редактирование */
    const handleEditStage = (stage: BlockStage) => {
        setEditingStage(stage);

        setFormData({
            name: stage.name,
            start_date: stage.start_date?.slice(0, 10),
            end_date: stage.end_date?.slice(0, 10),
        });

        setModalOpen(true);
    };

    /* submit формы */
    const handleSubmitStage = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingStage) {
                await dispatch(
                    updateBlockStage({
                        id: editingStage.id,
                        data: {
                            block_id: blockId,
                            ...formData,
                        },
                    }),
                ).unwrap();
                toast.success('Этап обновлен');
            } else {
                await dispatch(
                    createBlockStage({
                        block_id: blockId,
                        ...formData,
                    }),
                ).unwrap();
                toast.success('Этап создан');
            }

            setModalOpen(false);
            dispatch(
                fetchBlockStages({
                    block_id: blockId,
                    page,
                    size,
                }),
            );
            dispatch(fetchEnum('blockStages')); //вызов обновление справочника
        } catch {
            toast.error('Ошибка сохранения');
        }
    };

    /* удаление */
    const confirmDelete = async () => {
        if (!deleteState) return;

        try {
            if (deleteState.type === 'stage') {
                await dispatch(deleteBlockStage(deleteState.id)).unwrap();

                toast.success('Этап удален');

                dispatch(
                    fetchBlockStages({
                        block_id: blockId,
                        page,
                        size,
                    }),
                );
            }

            if (deleteState.type === 'subStage') {
                await dispatch(
                    deleteStageSubsection({
                        id: deleteState.id,
                        stageId: deleteState.stageId,
                    }),
                ).unwrap();

                toast.success('Подэтап удален');
            }
        } catch {
            toast.error('Ошибка удаления');
        } finally {
            setDeleteState(null);
        }
    };

    /************************************************************************************************************/
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<Add />} onClick={handleCreateStage}>
                    Добавить этап
                </Button>
            </Box>
            <div className="flex items-center gap-6 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600">Этапов:</span>
                    <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 bg-blue-500 text-white text-xs font-semibold rounded-full">
                        {totalStages}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <List className="w-4 h-4 text-indigo-600" />
                    <span className="text-gray-600">Подэтапов:</span>
                    <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 bg-blue-500 text-white text-xs font-semibold rounded-full">
                        {totalSubStages}
                    </span>
                </div>
            </div>
            {/* CONTENT */}

            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : stages.length === 0 ? (
                <Typography color="text.secondary">Этапы отсутствуют</Typography>
            ) : (
                <BlockStagesTable
                    stages={filteredStages}
                    onEditStage={handleEditStage}
                    onDeleteStageId={(id) => setDeleteState({ type: 'stage', id })}
                    onDeleteSubStageId={(id, stageId) =>
                        setDeleteState({ type: 'subStage', id, stageId })
                    }
                />
            )}

            {/* MODAL */}
            {modalOpen && (
                <BlockStageModal
                    editing={editingStage}
                    formData={formData}
                    onChange={setFormData}
                    onSubmit={handleSubmitStage}
                    onClose={() => setModalOpen(false)}
                />
            )}

            {/* DELETE STAGE */}
            <ConfirmDialog
                open={!!deleteState && deleteState.type === 'stage'}
                title="Удалить этап?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />

            {/* DELETE SUBSTAGE */}
            <ConfirmDialog
                open={!!deleteState && deleteState.type === 'subStage'}
                title="Удалить подэтап?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />
        </Paper>
    );
}
