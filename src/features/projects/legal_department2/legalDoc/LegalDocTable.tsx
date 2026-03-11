import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, FileText, DollarSign, Calendar } from 'lucide-react';
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
import { STAGE_STATUS_COLORS, STAGE_STATUS_LABELS } from '@/utils/status';
import { useReference } from '@/features/reference/useReference';
import getStatusColor from '@/utils/getStatusColor';

interface LegalDocTableProps {
    entityType: string;
    entityId: number;
}

export default function LegalDocTable({ entityType, entityId }: LegalDocTableProps) {
    const dispatch = useAppDispatch();
    const statuses = useReference('generalStatuses');
    const { items: documents, loading } = useAppSelector((state) => state.legalDocuments);
    const [formOpen, setFormOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<LegalDocument | null>(null);

    const legalDocs = documents.filter((doc) => doc.entity_id === entityId);
    console.log('stageDocuments', legalDocs);
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

    const handleSubmit = async (data: Partial<LegalDocument>) => {
        try {
            if (editingDocument) {
                await dispatch(updateLegalDocument({ id: editingDocument.id, data })).unwrap();
                toast.success('Документ обновлен');
            } else {
                await dispatch(createLegalDocument(data)).unwrap();
                toast.success('Документ создан');
            }
            dispatch(fetchLegalDocuments({ entity_type: entityType, entity_id: entityId }));
        } catch (error: any) {
            toast.error(error || 'Ошибка при сохранении документа');
        }
    };

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
        <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
            <div className="flex items-center justify-between mb-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Документы этапа
                    <Calendar className="ml-2">{legalDocs.length}</Calendar>
                </h4>
                <button onClick={handleCreate} className="h-8">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Добавить документ
                </button>
            </div>

            {legalDocs.length > 0 ? (
                <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
                    <table className="w-full">
                        <thead className="text-gray-700 bg-gray-50">
                            <tr className="border-b">
                                <td className="w-12 font-semibold">#</td>
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
                                    <td className="font-mono text-xs text-gray-500">{index + 1}</td>
                                    <td className="font-medium text-gray-900">{doc.name}</td>
                                    <td className="max-w-xs text-sm text-gray-600 truncate">
                                        {doc.description || '—'}
                                    </td>
                                    <td className="text-sm font-medium text-gray-900">
                                        {doc.price}
                                    </td>
                                    <td className="text-sm text-gray-600">
                                        {formatDateTime(doc.deadline)}
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={`px-2 py-1 font-medium rounded ${getStatusColor(doc.status)}`}
                                        >
                                            {doc.status != null ? doc.status : '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => handleEdit(doc)}
                                                className="inline-flex items-center justify-center text-blue-600 transition-colors rounded-md h-7 w-7 hover:bg-blue-50"
                                                title="Редактировать"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc)}
                                                className="inline-flex items-center justify-center text-red-600 transition-colors rounded-md h-7 w-7 hover:bg-red-50"
                                                title="Удалить"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
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
                    <button onClick={handleCreate}>
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Создать документ
                    </button>
                </div>
            )}

            {/* <DocumentForm
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSubmit={handleSubmit}
                document={editingDocument}
                stageId={stageId}
                projectId={projectId}
            /> */}
        </div>
    );
}
