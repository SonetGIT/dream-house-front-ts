import { useEffect, useState } from 'react';
import { Edit, FileText, PlusCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/app/store';
import { formatDateTime } from '@/utils/formatDateTime';
import { useReference } from '@/features/reference/useReference';
import { getStatusColor } from '@/utils/getStatusColor';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import {
    createLegalDocument,
    fetchLegalDocuments,
    updateLegalDocument,
    type LegalDocument,
    type LegalDocumentForm,
} from './legalDocSlice';
import { LegalDocModal } from './LegalDocModal';
import { uploadDocumentFile } from '../files/documentFilesSlice';
import { formatDate } from '@/utils/formatData';

interface LegalDocTableProps {
    entityType: string;
    entityId: number;
    onDeleteSubStageId: (id: number, stageId: number) => void;
}

export default function LegalDocTable({
    entityType,
    entityId,
    onDeleteSubStageId,
}: LegalDocTableProps) {
    const dispatch = useAppDispatch();
    const documentStatuses = useReference('documentStatuses');

    // Документы хранятся локально, чтобы запрос одного этапа
    // не подменял данные другого этапа в общей Redux-коллекции.
    const [legalDocs, setLegalDocs] = useState<LegalDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [openForm, setOpenForm] = useState(false);
    const [editingDocId, setEditingDocId] = useState<number | undefined>();
    const [initialData, setInitialData] = useState<LegalDocumentForm | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadDocuments = async () => {
            try {
                setLoading(true);

                const result = await dispatch(
                    fetchLegalDocuments({
                        entity_type: entityType,
                        entity_id: entityId,
                        page: 1,
                        size: 100,
                    }),
                ).unwrap();

                if (!cancelled) {
                    setLegalDocs(
                        result.data.filter(
                            (doc) =>
                                doc.entity_type === entityType &&
                                doc.entity_id === entityId &&
                                !doc.deleted,
                        ),
                    );
                }
            } catch {
                if (!cancelled) {
                    toast.error('Ошибка загрузки документов');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadDocuments();

        return () => {
            cancelled = true;
        };
    }, [dispatch, entityType, entityId]);

    const openCreate = () => {
        setEditingDocId(undefined);
        setInitialData({
            entity_type: entityType,
            entity_id: entityId,
            name: '',
            price: 0,
            description: '',
            responsible_users: [],
            deadline: '',
            location: '',
            status: 0,
        });
        setOpenForm(true);
    };

    const openEdit = (doc: LegalDocument) => {
        setEditingDocId(doc.id);
        setInitialData({
            entity_type: doc.entity_type,
            entity_id: doc.entity_id,
            name: doc.name,
            price: doc.price,
            description: doc.description,
            responsible_users: doc.responsible_users,
            deadline: doc.deadline,
            location: doc.location,
            status: doc.status,
        });
        setOpenForm(true);
    };

    const handleSave = async (data: LegalDocumentForm, files: File[]) => {
        try {
            setSaving(true);

            let documentId = editingDocId;

            if (documentId) {
                await dispatch(
                    updateLegalDocument({
                        id: documentId,
                        data,
                    }),
                ).unwrap();
            } else {
                const created = await dispatch(createLegalDocument(data)).unwrap();
                documentId = created.id;
            }

            for (const file of files) {
                await dispatch(
                    uploadDocumentFile({
                        documentId,
                        file,
                    }),
                ).unwrap();
            }

            const result = await dispatch(
                fetchLegalDocuments({
                    entity_type: entityType,
                    entity_id: entityId,
                    page: 1,
                    size: 100,
                }),
            ).unwrap();

            setLegalDocs(
                result.data.filter(
                    (doc) =>
                        doc.entity_type === entityType &&
                        doc.entity_id === entityId &&
                        !doc.deleted,
                ),
            );

            toast.success('Документ сохранён');
            setOpenForm(false);
        } catch {
            toast.error('Ошибка сохранения документа');
        } finally {
            setSaving(false);
        }
    };

    if (loading && legalDocs.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full animate-spin border-t-blue-600" />
                    <span>Загрузка документов...</span>
                </div>
            </div>
        );
    }

    /*******************************************************************************************************/
    return (
        <div className="rounded-lg bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
            <div className="flex items-center justify-between mb-2">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FileText className="w-4 h-4 text-purple-700" />
                    Список документов
                    {/* <span>{legalDocs.length}</span> */}
                </h4>

                <StyledTooltip title="Добавить документ">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center w-8 h-8 text-blue-600 transition-all duration-200 rounded-md bg-blue-50 hover:bg-blue-600 hover:text-white hover:shadow-md active:scale-95"
                        onClick={openCreate}
                    >
                        <PlusCircle className="w-6 h-6" />
                    </button>
                </StyledTooltip>
            </div>

            {legalDocs.length > 0 ? (
                <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
                    <table className="w-full min-w-[1000px]">
                        <thead className="text-gray-700 bg-gray-50">
                            <tr className="border-b">
                                <th className="px-3 py-2 text-sm text-left">№</th>
                                <th className="px-3 py-2 text-sm text-left">Название</th>
                                <th className="px-3 py-2 text-sm text-left">Описание</th>
                                <th className="px-3 py-2 text-sm text-left">Цена</th>
                                <th className="px-3 py-2 text-sm text-left">Крайний срок</th>
                                <th className="px-3 py-2 text-sm text-left">Местонахождение</th>
                                <th className="px-3 py-2 text-sm text-left">Статус</th>
                                <th className="px-3 py-2 text-sm text-left">Создан</th>
                                <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {legalDocs.map((doc, index) => (
                                <tr
                                    key={doc.id}
                                    className="cursor-pointer hover:bg-gray-50/50"
                                    onClick={() => openEdit(doc)}
                                >
                                    <td className="px-3 py-3 text-sm text-blue-500">{index + 1}</td>
                                    <td className="px-3 py-3 text-sm text-gray-600">{doc.name}</td>
                                    <td className="px-3 py-3 text-sm text-gray-600">
                                        {doc.description || '—'}
                                    </td>
                                    <td className="px-3 py-3 font-medium text-purple-600">
                                        {doc.price}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-gray-600">
                                        {formatDate(doc.deadline)}
                                    </td>
                                    <td className="px-3 py-3 font-medium text-purple-600">
                                        {doc.location || '—'}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-gray-600">
                                        <span
                                            className={`rounded px-2 py-1 font-medium ${getStatusColor(
                                                doc.status,
                                                documentStatuses.lookup,
                                            )}`}
                                        >
                                            {doc.status != null
                                                ? documentStatuses.lookup(doc.status)
                                                : '—'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-sm text-gray-600">
                                        {formatDateTime(doc.created_at)}
                                    </td>
                                    <td className="px-4 py-3 border-l">
                                        <div className="flex items-center justify-center gap-2">
                                            <StyledTooltip title="Редактировать">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        openEdit(doc);
                                                    }}
                                                    className="inline-flex items-center justify-center text-blue-600 transition-colors rounded-md h-7 w-7 hover:bg-blue-100"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </StyledTooltip>

                                            <StyledTooltip title="Удалить">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        onDeleteSubStageId(doc.id, entityId);
                                                    }}
                                                    className="inline-flex items-center justify-center text-red-600 transition-colors rounded-md h-7 w-7 hover:bg-red-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
