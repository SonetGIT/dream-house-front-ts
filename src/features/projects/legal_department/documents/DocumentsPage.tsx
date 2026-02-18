import { useAppDispatch } from '@/app/store';
import { useState } from 'react';
import { archiveDocument, fetchDocuments, underReviewDocument } from './documentsSlice';
import toast from 'react-hot-toast';
import { DocumentsTable } from './DocumentsTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useOutletContext } from 'react-router-dom';
import type { ProjectOutletContext } from '../../material_request/MaterialRequests';

export default function DocumentsPage() {
    const { projectId } = useOutletContext<ProjectOutletContext>();
    const dispatch = useAppDispatch();

    const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleSendUnderReview = (id: number) => {
        dispatch(underReviewDocument(id))
            .unwrap()
            .then(() => {
                dispatch(fetchDocuments({ page: 1, size: 10, project_id: projectId }));
                toast.success('Документ на проверке');
            })
            .catch((err) => {
                toast.error(err || 'Ошибка при отправке на проверку');
            });
    };

    const handleDelete = (id: number) => {
        setSelectedDocumentId(id);
        setConfirmOpen(true);
    };

    const handleConfirm = () => {
        if (!selectedDocumentId) return;

        dispatch(archiveDocument(selectedDocumentId))
            .unwrap()
            .then(() => {
                dispatch(fetchDocuments({ page: 1, size: 10, project_id: projectId }));
                toast.success('Документ успешно перенесен в архив');
            });

        setConfirmOpen(false);
        setSelectedDocumentId(null);
    };

    return (
        <>
            <DocumentsTable
                onDelete={handleDelete}
                handleSendUnderReview={handleSendUnderReview}
                project_id={projectId}
            />

            {/* Диалог подтверждения */}
            <ConfirmDialog
                open={confirmOpen}
                title="Удаление документа (в архив)"
                message="Вы уверены, что хотите удалить документ?"
                onConfirm={handleConfirm}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    );
}
