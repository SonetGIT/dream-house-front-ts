import { useEffect, useMemo, useState } from 'react';
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
import { fetchDocuments } from './documentsSlice';
import { formatDateTime } from '@/utils/formatDateTime';
import { DocumentEditForm } from './DocumentEditForm';
import { useReference } from '@/features/reference/useReference';

export function DocumentsTable() {
    const dispatch = useAppDispatch();
    const { data, pagination, loading, error } = useAppSelector((state) => state.documents);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Для редактирования
    const [editingDocId, setEditingDocId] = useState<number | null>(null);
    const [editingValues, setEditingValues] = useState<any>(null);

    // Справочники
    const { lookup: getdocStagesName } = useReference('8ba2b356-f147-4926-827c-113aafb7b2ff');
    const getRefName = useMemo(
        () => ({
            docStagesName: getdocStagesName,
        }),
        [getdocStagesName],
    );

    useEffect(() => {
        dispatch(
            fetchDocuments({
                page: page + 1,
                size: rowsPerPage,
            }),
        );
    }, [dispatch, page, rowsPerPage]);

    const handleChangePage = (_: any, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleEditClick = (doc: any) => {
        setEditingDocId(doc.id);
        setEditingValues({
            name: doc.name,
            description: doc.description,
            price: doc.price,
            status: doc.status,
        });
    };

    const handleSave = async (updatedValues: any) => {
        try {
            // PUT-запрос на обновление документа
            await fetch(`/api/documents/${editingDocId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedValues),
            });

            // Обновляем таблицу после сохранения
            dispatch(fetchDocuments({ page: page + 1, size: rowsPerPage }));
        } catch (err) {
            console.error('Ошибка сохранения документа', err);
        } finally {
            setEditingDocId(null);
            setEditingValues(null);
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

    if (!data.length) {
        return <Typography mt={2}>Документы не найдены</Typography>;
    }

    return (
        <Box>
            <TableContainer component={Paper} className="table-container">
                <Table className="table">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Название</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Цена</TableCell>
                            <TableCell>Описание</TableCell>
                            <TableCell>Создан</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((doc) => (
                            <TableRow
                                key={doc.id}
                                hover
                                sx={{
                                    '& td': { textAlign: 'center' },
                                    cursor: 'pointer',
                                }}
                                onClick={() => handleEditClick(doc)}
                            >
                                <TableCell>{doc.id}</TableCell>
                                <TableCell>{doc.name}</TableCell>
                                <TableCell>{getRefName.docStagesName(doc.status)}</TableCell>
                                <TableCell>{doc.price}</TableCell>
                                <TableCell>{doc.description}</TableCell>
                                <TableCell>{formatDateTime(doc.created_at)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={pagination?.total ?? 0}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />
            </TableContainer>

            {/* Форма редактирования */}
            {editingDocId && editingValues && (
                <DocumentEditForm
                    open={!!editingDocId}
                    onClose={() => setEditingDocId(null)}
                    documentId={editingDocId}
                    initialData={editingValues}
                    onSave={handleSave}
                />
            )}
        </Box>
    );
}
