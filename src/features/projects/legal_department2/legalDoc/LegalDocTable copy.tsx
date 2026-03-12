import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, FileText, DollarSign, Calendar, PlusCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    createLegalDocument,
    deleteLegalDocument,
    fetchLegalDocuments,
    updateLegalDocument,
    type LegalDocument,
} from './legalDocSlice';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/utils/formatDateTime';
import { useReference } from '@/features/reference/useReference';
import { getStatusColor } from '@/utils/getStatusColor';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import LegalDocModal, { type DocumentFormData } from './LegalDocModal';
import { uploadDocumentFile } from '../files/documentFilesSlice';

interface LegalDocTableProps {
    entityType: string;
    entityId: number;
    onDeleteSubStageId: (id: number, stageId: number) => void;
}

export default function LegalDocTable({ entityType, entityId }: LegalDocTableProps) {
    const dispatch = useAppDispatch();
    const { items: documents, loading } = useAppSelector((state) => state.legalDocuments);
    const statuses = useReference('generalStatuses');
    const [formOpen, setFormOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<LegalDocument | null>(null);
    const [openForm, setOpenForm] = useState(false);
    const [editingDocId, setEditingDocId] = useState<number | undefined>(undefined);
    const [initialData, setInitialData] = useState<LegalDocument | null>(null);
    const [saving, setSaving] = useState(false);

    const legalDocs = documents.filter((doc) => doc.entity_id === entityId);
    useEffect(() => {
        dispatch(fetchLegalDocuments({ entity_type: entityType, entity_id: entityId }));
    }, [dispatch, entityType, entityId]);

    const handleCreate = () => {
        setEditingDocument(null);
        setFormOpen(true);
    };

    const handleEdit = (document: LegalDocument) => {
        setEditingDocument(document);
        setFormOpen(true);
    };

    const handleDelete = async (document: LegalDocument) => {
        if (window.confirm(`Удалить документ "${document.name}"?`)) {
            // В реальном приложении здесь будет dispatch deleteDocument
            // await dispatch(deleteLegalDocument())
            toast.success('Документ удален');
        }
    };
    const handleSave = async (data: LegalDocument, files: File[]) => {
        try {
            setSaving(true);
            let docId = editingDocId;

            if (!docId) {
                const created = await dispatch(createLegalDocument(data)).unwrap();
                docId = created.id;
            } else {
                await dispatch(updateLegalDocument({ id: docId, data })).unwrap();
            }

            for (const file of files) {
                await dispatch(uploadDocumentFile({ documentId: docId!, file })).unwrap();
            }

            toast.success('Документ сохранён');
            // await dispatch(
            //     fetchLegalDocuments({ page: page + 1, size: rowsPerPage, project_id: props.project_id }),
            // );
            setOpenForm(false);
        } catch {
            toast.error('Ошибка сохранения документа');
        } finally {
            setSaving(false);
        }
    };
    // const handleSubmit = async (data: Partial<LegalDocument>) => {
    //     try {
    //         if (editingDocument) {
    //             await dispatch(updateLegalDocument({ id: editingDocument.id, data })).unwrap();
    //             toast.success('Документ обновлен');
    //         } else {
    //             await dispatch(createLegalDocument(data)).unwrap();
    //             toast.success('Документ создан');
    //         }
    //         dispatch(fetchLegalDocuments({ entity_type: entityType, entity_id: entityId }));
    //     } catch (error: any) {
    //         toast.error(error || 'Ошибка при сохранении документа');
    //     }
    // };

    if (loading && legalDocs.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full animate-spin border-t-blue-600"></div>
                    <span>Загрузка документов...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
            <div className="flex items-center justify-between mb-2">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FileText className="w-4 h-4 text-purple-700" />
                    Документы этапа
                    <span>{legalDocs.length}</span>
                </h4>
                <StyledTooltip title="Добавить документ">
                    <button
                        className="inline-flex items-center justify-center w-8 h-8 text-blue-600 transition-all duration-200 rounded-md bg-blue-50 hover:bg-blue-600 hover:text-white hover:shadow-md active:scale-95"
                        // onClick={() => handleCreate(item.id)}
                        onClick={() => handleCreate}
                    >
                        <PlusCircle className="w-6 h-6" />
                    </button>
                </StyledTooltip>
            </div>

            {legalDocs.length > 0 ? (
                <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
                    <table className="w-full">
                        <thead className="text-gray-700 bg-gray-50">
                            <tr className="border-b">
                                <th className="px-3 py-2 text-sm text-left">№</th>
                                <th className="px-3 py-2 text-sm text-left">Название</th>
                                <th className="px-3 py-2 text-sm text-left">Описание</th>
                                <th className="px-3 py-2 text-sm text-left">Стоимость</th>
                                <th className="px-3 py-2 text-sm text-left">Срок</th>
                                <th className="px-3 py-2 text-sm text-left">Статус</th>
                                <th className="px-3 py-2 text-sm text-center">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {legalDocs.map((doc, index) => (
                                <tr key={doc.id} className="hover:bg-gray-50/50">
                                    <td className="px-3 py-3 text-sm text-blue-500">{index + 1}</td>
                                    <td className="px-3 py-3 text-sm text-gray-600">{doc.name}</td>
                                    <td className="px-3 py-3 text-sm text-gray-600">
                                        {doc.description || '—'}
                                    </td>
                                    <td className="px-3 py-3 font-medium text-purple-600">
                                        {doc.price}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-gray-600">
                                        {formatDateTime(doc.deadline)}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-gray-600">
                                        <span
                                            className={`px-2 py-1 font-medium rounded ${getStatusColor(
                                                doc.status,
                                                statuses.lookup,
                                            )}`}
                                        >
                                            {doc.status != null ? statuses.lookup(doc.status) : '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-center gap-1">
                                            <StyledTooltip title="Редактировать">
                                                <button
                                                    onClick={() => handleEdit(doc)}
                                                    className="inline-flex items-center justify-center text-blue-600 transition-colors rounded-md h-7 w-7 hover:bg-blue-50"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </button>
                                            </StyledTooltip>
                                            <StyledTooltip title="Удалить">
                                                <button
                                                    onClick={() => handleDelete(doc)}
                                                    className="inline-flex items-center justify-center text-red-600 transition-colors rounded-md h-7 w-7 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </StyledTooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-8 text-center bg-white border border-gray-200 rounded-lg">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="mb-1 text-sm font-medium text-gray-900">Нет документов</p>
                    <p className="mb-4 text-xs text-gray-500">
                        Добавьте первый документ в этот этап
                    </p>
                </div>
            )}

            {openForm && initialData && (
                <LegalDocModal
                    open
                    documentId={editingDocId}
                    initialData={initialData}
                    submitting={saving}
                    onSubmit={handleSave}
                    onClose={() => setOpenForm(false)}
                />
            )}
        </div>
    );
}
