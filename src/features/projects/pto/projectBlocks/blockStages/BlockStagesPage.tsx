import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { Button, CircularProgress, Paper, Typography } from '@mui/material';
import { Box } from '@mui/material';
import { Add } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { createBlockStage, fetchBlockStages, type BlockStage } from './blockStagesSlice';
import BlockStagesTable from './BlockStagesTable';

export default function BlockStagesPage({ blockId }: { blockId: number }) {
    const dispatch = useAppDispatch();
    const stages = useAppSelector((s) =>
        s.blockStages.data.filter((st) => st.block_id === blockId),
    );
    const loading = useAppSelector((s) => s.blockStages.loading);
    const [editingStage, setEditingStage] = useState<BlockStage | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
    });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const size = 10;
    const [deleteState, setDeleteState] = useState<
        { type: 'stage'; id: number } | { type: 'subStage'; id: number; stageId: number } | null
    >(null);

    /* подгрузка BLOCK STAGES */
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

    const filteredStages = useMemo(() => {
        return stages.filter((stage) => stage.name.toLowerCase().includes(search.toLowerCase()));
    }, [stages, search]);

    const handleCreateBlockStage = async () => {
        try {
            await dispatch(
                createBlockStage({
                    block_id: blockId,
                    name: '',
                    start_date: new Date().toISOString(),
                    end_date: new Date().toISOString(),
                }),
            ).unwrap();

            toast.success('Смета создана');
        } catch {
            toast.error('Ошибка создания сметы');
        }
    };

    /************************************************************************************************/
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<Add />} onClick={handleCreateBlockStage}>
                    Добавить этап
                </Button>
            </Box>
            {/* CONTENT */}
            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : stages.length === 0 ? (
                <Typography color="text.secondary">"Этапы отсутствуют</Typography>
            ) : (
                <>
                    <BlockStagesTable
                        stages={filteredStages}
                        onDeleteStageId={(id) => setDeleteState({ type: 'stage', id })}
                        onDeleteSubStageId={(id, stageId) =>
                            setDeleteState({ type: 'subStage', id, stageId })
                        }
                    />
                </>
            )}
        </Paper>
    );
}
