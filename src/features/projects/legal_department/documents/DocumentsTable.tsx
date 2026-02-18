import { useEffect, useState } from 'react';
import {
    Box,
    CircularProgress,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    Paper,
    TablePagination,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { createDocuments, fetchDocuments, updateDocuments } from './documentsSlice';
import { formatDateTime } from '@/utils/formatDateTime';
import { DocumentCreateEditForm, type DocumentFormData } from './DocumentCreateEditForm';
import { useReference } from '@/features/reference/useReference';
import toast from 'react-hot-toast';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AppButton } from '@/components/ui/AppButton';
import { MdDelete, MdOutlinePlaylistAdd, MdOutlineSendTimeExtension } from 'react-icons/md';
import { uploadDocumentFile } from '../files/documentFilesSlice';
import StatusChip from '@/components/ui/StatusChip';
import { TableRowActions } from '@/components/ui/TableRowActions';

interface PropsType {
    project_id: number;
    // stage_id: number;
    onDelete: (id: number) => void;
    handleSendUnderReview: (id: number) => void;
}
/***********************************************************************************************************************/
export function DocumentsTable(props: PropsType) {
    const dispatch = useAppDispatch();
    const { data, pagination, loading, error } = useAppSelector((state) => state.documents);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [openForm, setOpenForm] = useState(false);
    const [editingDocId, setEditingDocId] = useState<number | undefined>(undefined);
    const [initialData, setInitialData] = useState<DocumentFormData | null>(null);
    const [saving, setSaving] = useState(false);

    const documentStatuses = useReference('documentStatuses');

    useEffect(() => {
        dispatch(
            fetchDocuments({ page: page + 1, size: rowsPerPage, project_id: props.project_id }),
        );
    }, [dispatch, page, rowsPerPage]);

    const openCreate = () => {
        setEditingDocId(undefined);
        setInitialData({
            project_id: props.project_id,
            // stage_id: props.stage_id,
            name: '',
            price: 0,
            description: '',
            responsible_users: [],
            deadline: null,
            status: 0,
        });
        setOpenForm(true);
    };

    const openEdit = (doc: any) => {
        setEditingDocId(doc.id);
        setInitialData({
            project_id: props.project_id,
            name: doc.name,
            price: doc.price,
            description: doc.description,
            responsible_users: doc.responsible_users,
            deadline: doc.deadline,
            status: doc.status,
        });
        setOpenForm(true);
    };

    const handleSave = async (data: DocumentFormData, files: File[]) => {
        try {
            setSaving(true);
            let docId = editingDocId;

            if (!docId) {
                const created = await dispatch(createDocuments(data)).unwrap();
                docId = created.id;
            } else {
                await dispatch(updateDocuments({ id: docId, data })).unwrap();
            }

            for (const file of files) {
                await dispatch(uploadDocumentFile({ documentId: docId!, file })).unwrap();
            }

            toast.success('Документ сохранён');
            await dispatch(
                fetchDocuments({ page: page + 1, size: rowsPerPage, project_id: props.project_id }),
            );
            setOpenForm(false);
        } catch {
            toast.error('Ошибка сохранения документа');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    /****************************************************************************************************************************/
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionHeader title="Список документов" />
                <AppButton
                    variant="outlined"
                    startIcon={<MdOutlinePlaylistAdd />}
                    onClick={openCreate}
                >
                    Добавить документ
                </AppButton>
            </Box>

            <TableContainer component={Paper} className="table-container">
                <Table className="table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Наименование</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Цена</TableCell>
                            <TableCell>Крайний срок</TableCell>
                            <TableCell>Создан</TableCell>
                            <TableCell>Действие</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((doc) => (
                            <TableRow
                                key={doc.id}
                                hover
                                sx={{ '& td': { textAlign: 'center' }, cursor: 'pointer' }}
                                onClick={() => openEdit(doc)}
                            >
                                <TableCell>{doc.id}</TableCell>
                                <TableCell>{doc.name}</TableCell>
                                <TableCell>
                                    <StatusChip
                                        label={documentStatuses.lookup(doc.status)}
                                        status={doc.status}
                                    />
                                </TableCell>
                                <TableCell>{doc.price}</TableCell>
                                <TableCell>{formatDateTime(doc.deadline, false)}</TableCell>
                                <TableCell>{formatDateTime(doc.created_at)}</TableCell>
                                <TableCell>
                                    <TableRowActions
                                        actions={[
                                            {
                                                key: 'edit',
                                                label: 'На подпись',
                                                icon: <MdOutlineSendTimeExtension size={18} />,
                                                onClick: () => props.handleSendUnderReview(doc.id),
                                            },
                                            {
                                                key: 'delete',
                                                label: 'Удалить',
                                                icon: <MdDelete size={18} />,
                                                onClick: () => props.onDelete(doc.id),
                                                color: 'error',
                                            },
                                        ]}
                                    />
                                    {/* <StyledTooltip title="На подпись">
                                        <MdOutlineSendTimeExtension
                                            size={22}
                                            color="#2c7ecb"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                props.handleSendUnderReview(doc.id);
                                            }}
                                            style={{ marginRight: '1rem' }}
                                        />
                                    </StyledTooltip>

                                    <StyledTooltip title="Удалить">
                                        <RiDeleteBin3Fill
                                            size={22}
                                            color="#c96161"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                props.onDelete(doc.id);
                                            }}
                                        />
                                    </StyledTooltip> */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    count={pagination?.total ?? 0}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setPage(0);
                    }}
                />
            </TableContainer>

            {openForm && initialData && (
                <DocumentCreateEditForm
                    open
                    documentId={editingDocId}
                    initialData={initialData}
                    submitting={saving}
                    onSubmit={handleSave}
                    onClose={() => setOpenForm(false)}
                />
            )}
        </Box>
    );
}
