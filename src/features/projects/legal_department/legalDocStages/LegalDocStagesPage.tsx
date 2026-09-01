import { Add } from '@mui/icons-material';
import { Box, Button, CircularProgress, IconButton, Input, Paper } from '@mui/material';
import { CheckCircle2, FileText, FolderOpen, Layers, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { TablePagination } from '@/components/ui/TablePagination';
import type { ProjectOutletContext } from '../../pto/PtoPage';
import { deleteLegalDocument } from '../legalDoc/legalDocSlice';
import LegalDocStageModal from './LegalDocStageModal';
import LegalDocStagesTable from './LegalDocStagesTable';
import {
    createLegalDocStage,
    deleteLegalDocStage,
    fetchLegalDocStages,
    updateLegalDocStage,
    type LegalDocStages,
} from './legalDocStageSlice';

export default function LegalDocStagesPage() {
    const { projectId } = useOutletContext<ProjectOutletContext>();
    const dispatch = useAppDispatch();

    const {
        data: stages,
        pagination,
        loading,
        error,
    } = useAppSelector((state) => state.legalDocStages);

    const { items } = useAppSelector((state) => state.legalDocuments);

    const [editingStage, setEditingStage] = useState<LegalDocStages | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '' });
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [search, setSearch] = useState('');
    const [deleteState, setDeleteState] = useState<
        | { type: 'legalStage'; id: number }
        | { type: 'legalSubStage'; id: number; stageId: number }
        | null
    >(null);

    const totalDocuments = items.filter((doc) => !doc.deleted).length;
    const signedDocuments = items.filter((doc) => doc.status === 3 && !doc.deleted).length;

    const totalValue = items
        .filter((doc) => !doc.deleted)
        .reduce((sum, doc) => sum + (doc.price || 0), 0);

    const stagesCount = pagination?.total ?? stages.length;

    const loadStages = () =>
        dispatch(
            fetchLegalDocStages({
                project_id: projectId,
                page,
                size,
                search: search.trim() || undefined,
            }),
        );

    useEffect(() => {
        if (!projectId) return;

        dispatch(
            fetchLegalDocStages({
                project_id: projectId,
                page,
                size,
            }),
        );
    }, [dispatch, projectId, page, size]);

    useEffect(() => {
        if (!projectId) return;

        const timeoutId = window.setTimeout(() => {
            dispatch(
                fetchLegalDocStages({
                    project_id: projectId,
                    page,
                    size,
                    search: search.trim() || undefined,
                }),
            );
        }, 300);

        return () => window.clearTimeout(timeoutId);
    }, [dispatch, projectId, page, size, search]);
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleCreateStage = () => {
        setEditingStage(null);
        setFormData({ name: '' });
        setModalOpen(true);
    };

    const handleEditStage = (stage: LegalDocStages) => {
        setEditingStage(stage);
        setFormData({ name: stage.name });
        setModalOpen(true);
    };

    const handleSubmitStage = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            if (editingStage) {
                await dispatch(
                    updateLegalDocStage({
                        id: editingStage.id,
                        data: {
                            project_id: projectId,
                            ...formData,
                        },
                    }),
                ).unwrap();

                toast.success('Этап успешно обновлен');
            } else {
                await dispatch(
                    createLegalDocStage({
                        project_id: projectId,
                        ...formData,
                    }),
                ).unwrap();

                toast.success('Этап успешно создан');
            }

            await loadStages();
            setModalOpen(false);
        } catch {
            toast.error('Ошибка сохранения');
        }
    };

    const confirmDelete = async () => {
        if (!deleteState) return;

        try {
            if (deleteState.type === 'legalStage') {
                await dispatch(deleteLegalDocStage(deleteState.id)).unwrap();
                await loadStages();

                toast.success('Этап успешно удален');
            }

            if (deleteState.type === 'legalSubStage') {
                await dispatch(
                    deleteLegalDocument({
                        id: deleteState.id,
                        stageId: deleteState.stageId,
                    }),
                ).unwrap();

                toast.success('Документ успешно удален');
            }
        } catch {
            toast.error('Ошибка удаления');
        } finally {
            setDeleteState(null);
        }
    };

    function StatisticBadge({
        icon,
        color,
        background,
        label,
        value,
    }: {
        icon: React.ReactNode;
        color: string;
        background: string;
        label: string;
        value: React.ReactNode;
    }) {
        return (
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-[13px] text-stone-500">{label}:</span>
                <span
                    className="rounded border px-2 py-0.5 text-xs font-semibold"
                    style={{
                        color,
                        backgroundColor: background,
                        borderColor: `${color}22`,
                    }}
                >
                    {value}
                </span>
            </div>
        );
    }

    return (
        <Paper sx={{ p: 2, borderRadius: 3 }}>
            <div className="flex items-center gap-4 mb-3 overflow-x-auto text-sm">
                <div className="flex items-center gap-4 pb-2 pr-4 border-b shrink-0 border-stone-200">
                    <StatisticBadge
                        icon={<Layers className="w-4 h-4 text-blue-600" />}
                        color="#1976d2"
                        background="#e3f2fd"
                        label="Этапы"
                        value={stagesCount}
                    />

                    <StatisticBadge
                        icon={<FileText className="w-4 h-4 text-indigo-600" />}
                        color="#6a1b9a"
                        background="#f3e5f5"
                        label="Документы"
                        value={totalDocuments}
                    />

                    <StatisticBadge
                        icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
                        color="#2e7d32"
                        background="#e8f5e9"
                        label="Подписано"
                        value={signedDocuments}
                    />

                    <div className="flex items-center gap-2">
                        <span className="text-[13px] text-stone-500">Сумма:</span>
                        <span className="rounded border border-purple-100 bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">
                            {new Intl.NumberFormat('ru-KG', {
                                style: 'currency',
                                currency: 'KGS',
                                minimumFractionDigits: 0,
                            }).format(totalValue)}
                        </span>
                    </div>
                </div>

                <div className="relative min-w-[220px] flex-1">
                    <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />

                    <Input
                        fullWidth
                        value={search}
                        placeholder="Поиск..."
                        className="text-sm h-9 pl-9 pr-9"
                        onChange={(event) => {
                            setPage(1);
                            setSearch(event.target.value);
                        }}
                    />

                    {search && (
                        <IconButton
                            size="small"
                            aria-label="Очистить поиск"
                            className="!absolute right-1 top-1/2 !-translate-y-1/2"
                            onClick={() => {
                                setPage(1);
                                setSearch('');
                            }}
                        >
                            <X className="w-4 h-4" />
                        </IconButton>
                    )}
                </div>

                <div className="shrink-0">
                    <Button variant="outlined" startIcon={<Add />} onClick={handleCreateStage}>
                        Добавить этап
                    </Button>
                </div>
            </div>

            {loading ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : stages.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
                        <FolderOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="mb-1 text-base font-medium text-gray-900">
                        В объекте отсутствуют этапы документов. Добавьте новый этап кнопкой
                        «Добавить этап».
                    </h3>
                </div>
            ) : (
                <>
                    <LegalDocStagesTable
                        stages={stages}
                        loading={loading}
                        onEditStage={handleEditStage}
                        onDeleteStageId={(id) => setDeleteState({ type: 'legalStage', id })}
                        onDeleteSubStageId={(id, stageId) =>
                            setDeleteState({ type: 'legalSubStage', id, stageId })
                        }
                    />

                    {pagination && (
                        <TablePagination
                            pagination={pagination}
                            onPageChange={setPage}
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

            {modalOpen && (
                <LegalDocStageModal
                    editing={editingStage}
                    formData={formData}
                    onChange={setFormData}
                    onSubmit={handleSubmitStage}
                    onClose={() => setModalOpen(false)}
                />
            )}

            <ConfirmDialog
                open={!!deleteState && deleteState.type === 'legalStage'}
                title="Удалить этап?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />

            <ConfirmDialog
                open={!!deleteState && deleteState.type === 'legalSubStage'}
                title="Удалить подэтап юр?"
                message="Это действие нельзя отменить."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteState(null)}
            />
        </Paper>
    );
}
