import type { AppDispatch } from '@/app/store';
import { createDocument, fetchDocuments } from '@/features/projects/documents/documentsSlice';

export const getOrCreateWorkPerformedDocument = async (
    dispatch: AppDispatch,
    workPerformedId: number,
) => {
    const docsResult = await dispatch(
        fetchDocuments({
            entity_type: 'workPerformed',
            entity_id: workPerformedId,
            page: 1,
            size: 1,
        }),
    ).unwrap();

    const existingDocument = docsResult.data?.[0];

    if (existingDocument?.id) {
        return existingDocument.id;
    }

    const createdDocument = await dispatch(
        createDocument({
            entity_type: 'workPerformed',
            entity_id: workPerformedId,
            name: `Файлы Акта №${workPerformedId}`,
            status: 3,
        }),
    ).unwrap();

    if (!createdDocument?.id) {
        throw new Error('Не удалось создать документ для файлов акта');
    }

    return createdDocument.id;
};
