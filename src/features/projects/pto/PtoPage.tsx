import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Paper } from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    createProjectBlock,
    deleteProjectBlock,
    fetchProjectBlocks,
    updateProjectBlock,
    type ProjectBlock,
} from './projectBlocks/projectBlocksSlice';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProjectBlockModal from './projectBlocks/ProjectBlockModal';
import ProjectBlocksTable from './projectBlocks/ProjectBlocksTable';
import { Add } from '@mui/icons-material';
import { TablePagination } from '@/components/ui/TablePagination';
import { FolderOpen } from 'lucide-react';

export interface ProjectOutletContext {
    projectId: number;
}
/****************************************************************************************************************/
export default function PtoPage() {
    const { projectId } = useOutletContext<ProjectOutletContext>();

    const dispatch = useAppDispatch();
    const {
        data: prjBlocks,
        pagination: prjPagination,
        loading: prjBlocksLoading,
    } = useAppSelector((state) => state.projectBlocks);

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [selectedProjectBlockId, setSelectedProjectBlockId] = useState<number | null>(null);

    /* STATE */
    const [openCreate, setOpenCreate] = useState(false);
    const [editingBlock, setEditingBlock] = useState<ProjectBlock | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    /* FETCH */
    useEffect(() => {
        if (projectId) {
            dispatch(
                fetchProjectBlocks({
                    page,
                    size,
                    project_id: projectId,
                }),
            );
        }
    }, [dispatch, projectId, page, size]);

    /*CREATE*/
    const handleCreate = async (data: Partial<ProjectBlock>) => {
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
                    page,
                    size,
                    project_id: projectId,
                }),
            );

            setOpenCreate(false);
            setEditingBlock(null);
        } catch (error: any) {
            toast.error(error || 'Ошибка при сохранении блока');
        }
    };

    /* DELETE */
    const handleDelete = (id: number) => {
        setSelectedProjectBlockId(id);
        setConfirmOpen(true);
    };

    /* CONFIRM DELETE */
    const handleConfirm = async () => {
        if (!selectedProjectBlockId) return;

        try {
            await dispatch(deleteProjectBlock(selectedProjectBlockId)).unwrap();

            dispatch(
                fetchProjectBlocks({
                    page,
                    size,
                    project_id: projectId,
                }),
            );

            toast.success('Блок проекта успешно удален');
        } catch (error: any) {
            toast.error(
                error || 'Ошибка при удалении блока проекта. Проверьте права доступа на удаление.',
            );
        } finally {
            setConfirmOpen(false);
            setSelectedProjectBlockId(null);
        }
    };

    /*****************************************************************************************************************************/
    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<Add />} onClick={() => setOpenCreate(true)}>
                    Создать блок
                </Button>
            </Box>
            {/* CONTENT */}
            {prjBlocksLoading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : prjBlocks.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                        <FolderOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="mb-1 text-base font-medium text-gray-900">
                        В объекте блоки отсутствуют. Добавьте блок нажав на кнопку "Создать блок".
                    </h3>
                </div>
            ) : (
                <>
                    <ProjectBlocksTable
                        prjBlocks={prjBlocks}
                        onEdit={setEditingBlock}
                        onDelete={handleDelete}
                    />

                    {prjPagination && (
                        <TablePagination
                            pagination={prjPagination}
                            onPageChange={(newPage) => setPage(newPage)}
                            onSizeChange={(newSize) => {
                                setPage(1);
                                setSize(newSize);
                            }}
                            sizeOptions={[10, 25, 50, 100]}
                            showFirstButton
                            showLastButton
                        />
                    )}
                </>
            )}

            {/* CREATE/EDIT MODAL */}
            <ProjectBlockModal
                open={openCreate || !!editingBlock}
                projectId={projectId}
                block={editingBlock}
                onSubmit={handleCreate}
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
        </Paper>
    );
}
