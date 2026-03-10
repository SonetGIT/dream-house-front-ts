import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    createProjectBlock,
    deleteProjectBlock,
    fetchProjectBlocks,
    updateProjectBlock,
    type ProjectBlock,
} from './projectBlocks/projectBlocksSlice';
import ProjectBlocksSidebar from './projectBlocks/ProjectBlocksSidebar';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProjectBlockPage from './projectBlocks/ProjectBlockPage';
import ProjectBlockModal from './projectBlocks/ProjectBlockModal';

interface ProjectOutletContext {
    projectId: number;
}

export default function PtoManager() {
    const { projectId } = useOutletContext<ProjectOutletContext>();

    const dispatch = useAppDispatch();
    const { data: blocks, loading } = useAppSelector((state) => state.projectBlocks);

    const [selectedProjectBlockId, setSelectedProjectBlockId] = useState<number | null>(null);

    /* STATE */
    const [openCreate, setOpenCreate] = useState(false);
    const [editingBlock, setEditingBlock] = useState<ProjectBlock | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const currentBlock = useMemo(
        () => blocks.find((b) => b.id === selectedProjectBlockId) ?? null,
        [blocks, selectedProjectBlockId],
    );
    console.log('cnl', currentBlock);

    /* FETCH */
    useEffect(() => {
        if (projectId) {
            dispatch(
                fetchProjectBlocks({
                    page: 1,
                    size: 10,
                    project_id: projectId,
                }),
            );
        }
    }, [dispatch, projectId]);

    /* AUTO SELECT */
    useEffect(() => {
        if (blocks.length > 0 && !selectedProjectBlockId) {
            setSelectedProjectBlockId(blocks[0].id);
        }

        if (blocks.length === 0) {
            setSelectedProjectBlockId(null);
        }
    }, [blocks]);

    /* DELETE */
    const handleDelete = (id: number) => {
        setSelectedProjectBlockId(id);
        setConfirmOpen(true);
    };

    const handleConfirm = () => {
        if (!selectedProjectBlockId) return;

        dispatch(deleteProjectBlock(selectedProjectBlockId))
            .unwrap()
            .then(() => {
                dispatch(fetchProjectBlocks({ page: 1, size: 100, project_id: projectId }));
                toast.success('Блок проекта успешно удален');
            });

        setConfirmOpen(false);
        setSelectedProjectBlockId(null);
    };

    const handleSubmit = async (data: Partial<ProjectBlock>) => {
        try {
            if (editingBlock) {
                await dispatch(
                    updateProjectBlock({
                        id: editingBlock.id,
                        data,
                    }),
                ).unwrap();

                toast.success('Блок успешно обновлен');
            } else {
                await dispatch(createProjectBlock(data)).unwrap();

                toast.success('Блок успешно создан');
            }

            dispatch(
                fetchProjectBlocks({
                    page: 1,
                    size: 10,
                    project_id: projectId,
                }),
            );

            setOpenCreate(false);
            setEditingBlock(null);
        } catch (error: any) {
            toast.error(error || 'Ошибка при сохранении блока');
        }
    };
    /*****************************************************************************************************************************/
    return (
        <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
            <ProjectBlocksSidebar
                blocks={blocks}
                selectedBlockId={selectedProjectBlockId}
                onSelect={setSelectedProjectBlockId}
                onCreate={() => setOpenCreate(true)}
                onEdit={(block) => setEditingBlock(block)}
                onDelete={handleDelete}
                loading={loading}
            />
            <ProjectBlockPage
                blockId={selectedProjectBlockId}
                blockName={blocks.find((b) => b.id === selectedProjectBlockId)?.name || ''}
                currentBlock={currentBlock}
            />

            <ProjectBlockModal
                open={openCreate || !!editingBlock}
                projectId={projectId}
                block={editingBlock}
                onSubmit={handleSubmit}
                onClose={() => {
                    setOpenCreate(false);
                    setEditingBlock(null);
                }}
            />

            {/* Диалог подтверждения */}
            <ConfirmDialog
                open={confirmOpen}
                title="Удаление блока"
                message="Вы уверены, что хотите удалить блока?"
                onConfirm={handleConfirm}
                onCancel={() => setConfirmOpen(false)}
            />
        </Box>
    );
}
