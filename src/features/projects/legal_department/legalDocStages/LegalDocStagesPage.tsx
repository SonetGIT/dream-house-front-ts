import { useEffect, useState } from 'react';
import { Search, Layers, FileText, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import toast from 'react-hot-toast';
import { Button, Input } from '@mui/material';
import LegalDocStagesTable from './LegalDocStagesTable';
import {
    createLegalDocStage,
    deleteLegalDocStage,
    fetchLegalDocStages,
    updateLegalDocStage,
    type LegalDocStages,
} from './legalDocStageSlice';
import { Add } from '@mui/icons-material';
import LegalDocStageModal from './LegalDocStageModal';
import { useOutletContext } from 'react-router-dom';
import type { ProjectOutletContext } from '../../material_request/MaterialRequestsPage';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { deleteLegalDocument } from '../legalDoc/legalDocSlice';

export default function LegalDocStagesPage() {
    /* HOOKS */

    const { projectId } = useOutletContext<ProjectOutletContext>();
    const dispatch = useAppDispatch();

    const { data: stages, loading, error } = useAppSelector((state) => state.legalDocStages);

    const { items } = useAppSelector((state) => state.legalDocuments);

    /* STATE */

    const [editingStage, setEditingStage] = useState<LegalDocStages | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '' });

    const [page, setPage] = useState(1);
    const size = 10;

    const [search, setSearch] = useState('');

    const [deleteState, setDeleteState] = useState<
        | { type: 'legalStage'; id: number }
        | { type: 'legalSubStage'; id: number; stageId: number }
        | null
    >(null);

    /* DERIVED STATE */

    const filteredStages = stages.filter((stage) =>
        stage.name.toLowerCase().includes(search.toLowerCase()),
    );

    const totalDocuments = items.filter((doc) => !doc.deleted).length;

    const signedDocuments = items.filter((doc) => doc.status === 3 && !doc.deleted).length;

    const totalValue = items
        .filter((doc) => !doc.deleted)
        .reduce((sum, doc) => sum + (doc.price || 0), 0);

    /* EFFECTS */

    /* загрузка этапов */
    useEffect(() => {
        if (!projectId) return;

        dispatch(
            fetchLegalDocStages({
                project_id: projectId,
                page,
                size,
            }),
        );
    }, [dispatch, projectId, page]);

    /* ошибки */
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    /*HANDLERS*/
    /* создание этапа */
    const handleCreateStage = () => {
        setEditingStage(null);
        setFormData({ name: '' });
        setModalOpen(true);
    };

    /* редактирование */
    const handleEditStage = (stage: LegalDocStages) => {
        setEditingStage(stage);
        setFormData({ name: stage.name });
        setModalOpen(true);
    };

    /* submit формы */
    const handleSubmitStage = async (e: React.FormEvent) => {
        e.preventDefault();

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

                toast.success('Этап обновлен');
            } else {
                await dispatch(
                    createLegalDocStage({
                        project_id: projectId,
                        ...formData,
                    }),
                ).unwrap();

                toast.success('Этап создан');
            }

            setModalOpen(false);

            dispatch(
                fetchLegalDocStages({
                    project_id: projectId,
                    page,
                    size,
                }),
            );
        } catch {
            toast.error('Ошибка сохранения');
        }
    };

    /* удаление */
    const confirmDelete = async () => {
        if (!deleteState) return;

        try {
            if (deleteState.type === 'legalStage') {
                await dispatch(deleteLegalDocStage(deleteState.id)).unwrap();

                toast.success('Этап удален');

                dispatch(
                    fetchLegalDocStages({
                        project_id: projectId,
                        page,
                        size,
                    }),
                );
            }

            if (deleteState.type === 'legalSubStage') {
                await dispatch(
                    deleteLegalDocument({
                        id: deleteState.id,
                        stageId: deleteState.stageId,
                    }),
                ).unwrap();

                toast.success('Документ удален');
            }
        } catch {
            toast.error('Ошибка удаления');
        } finally {
            setDeleteState(null);
        }
    };

    /*****************************************************************************************************************************/
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30">
            {/* <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30"> */}
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Шапка */}
                <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-medium">
                                Управление этапами и юридическими документами
                            </p>
                        </div>
                    </div>

                    {/* Поиск слева, Статистика справа */}
                    <div className="flex items-center gap-6">
                        {/* Левая часть: Поиск и фильтры */}
                        <div className="flex flex-1 gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
                                <Input
                                    type="text"
                                    placeholder="Поиск..."
                                    className="pl-12 text-base h-11"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Правая часть: Статистика */}
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">Этапов:</span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                                    {stages.length}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    Документов:
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500 text-white">
                                    {totalDocuments}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    Подписано:
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                                    {signedDocuments}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-purple-600">KG</span>
                                <span className="text-sm font-medium text-gray-700">Сумма:</span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500 text-white">
                                    {new Intl.NumberFormat('ru-KG', {
                                        style: 'currency',
                                        currency: 'KGS',
                                        minimumFractionDigits: 0,
                                    }).format(totalValue)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Таблица этапов с вложенными документами */}
                <div>
                    <div className="flex justify-end mb-2">
                        <Button variant="outlined" startIcon={<Add />} onClick={handleCreateStage}>
                            Добавить этап
                        </Button>
                    </div>
                    <LegalDocStagesTable
                        stages={filteredStages}
                        loading={loading}
                        onEditStage={handleEditStage}
                        onDeleteStageId={(id) => setDeleteState({ type: 'legalStage', id })}
                        onDeleteSubStageId={(id, stageId) =>
                            setDeleteState({ type: 'legalSubStage', id, stageId })
                        }
                    />
                </div>
                {/* MODAL */}
                {modalOpen && (
                    <LegalDocStageModal
                        editing={editingStage}
                        formData={formData}
                        onChange={setFormData}
                        onSubmit={handleSubmitStage}
                        onClose={() => setModalOpen(false)}
                    />
                )}
                {/* DELETE STAGE */}
                <ConfirmDialog
                    open={!!deleteState && deleteState.type === 'legalStage'}
                    title="Удалить этап?"
                    message="Это действие нельзя отменить."
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteState(null)}
                />

                {/* DELETE SUBSTAGE */}
                <ConfirmDialog
                    open={!!deleteState && deleteState.type === 'legalSubStage'}
                    title="Удалить подэтап юр?"
                    message="Это действие нельзя отменить."
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteState(null)}
                />
            </div>
        </div>
    );
}
