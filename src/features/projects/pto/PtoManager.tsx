import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    deleteProjectBlock,
    fetchProjectBlocks,
    type ProjectBlock,
} from './projectBlocks/projectBlocksSlice';
import ProjectBlocksSidebar from './projectBlocks/ProjectBlocksSidebar';
import ProjectBlockDetails from './projectBlocks/ProjectBlockDetails';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProjectBlockCreateEditForm from './projectBlocks/ProjectBlockCreateEditForm';

interface ProjectOutletContext {
    projectId: number;
}

export default function PtoManager() {
    const { projectId } = useOutletContext<ProjectOutletContext>();

    const dispatch = useAppDispatch();
    const { data: blocks, loading } = useAppSelector((state) => state.projectBlocks);

    const [selectedProjectBlockId, setSelectedProjectBlockId] = useState<number | null>(null);

    /* DIALOG STATE */
    const [openCreate, setOpenCreate] = useState(false);
    const [editingBlock, setEditingBlock] = useState<ProjectBlock | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    /* ================= FETCH ================= */
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

    /* ================= AUTO SELECT ================= */
    useEffect(() => {
        if (blocks.length > 0 && !selectedProjectBlockId) {
            setSelectedProjectBlockId(blocks[0].id);
        }

        if (blocks.length === 0) {
            setSelectedProjectBlockId(null);
        }
    }, [blocks]);

    /* ================= DELETE ================= */
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

            <ProjectBlockDetails
                blockId={selectedProjectBlockId}
                blockName={blocks.find((b) => b.id === selectedProjectBlockId)?.name || ''}
            />

            <ProjectBlockCreateEditForm
                open={openCreate || !!editingBlock}
                onClose={() => {
                    setOpenCreate(false);
                    setEditingBlock(null);
                }}
                projectId={projectId}
                block={editingBlock}
            />

            {/* Диалог подтверждения */}
            <ConfirmDialog
                open={confirmOpen}
                title="Удаление проекта"
                message="Вы уверены, что хотите удалить проект?"
                onConfirm={handleConfirm}
                onCancel={() => setConfirmOpen(false)}
            />
        </Box>
    );
}
