import { useEffect, useState } from 'react';
import {
    Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { MdDelete, MdEdit, MdOutlinePlaylistAdd, MdOutlineRestartAlt } from 'react-icons/md';
import toast from 'react-hot-toast';
import InputSearch from '@/components/ui/InputSearch';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { TablePagination } from '@/components/ui/TablePagination';
import { useAppDispatch } from '@/app/store';
import { fetchEnum } from '@/features/reference/referenceSlice';
import type { Pagination } from '@/features/users/userSlice';
import { deleteMaterialType, saveMaterialType, searchMaterialTypes } from './materialTypesApi';
import type { MaterialType, MaterialTypesQuery } from './materialTypesApi';

const errorMessage = (reason: unknown) => reason instanceof Error ? reason.message : 'Ошибка запроса';

export default function MaterialTypesPage() {
    const dispatch = useAppDispatch();
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState<MaterialTypesQuery>({ name: '', page: 1, size: 10 });
    const [rows, setRows] = useState<MaterialType[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);
    const [editing, setEditing] = useState<MaterialType | null | undefined>(undefined);
    const [deleting, setDeleting] = useState<MaterialType | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        searchMaterialTypes(query).then((response) => {
            if (!active) return;
            if (response.data.length === 0 && query.page > 1) {
                setQuery((current) => ({ ...current, page: current.page - 1 }));
                return;
            }
            setRows(response.data);
            setPagination(response.pagination ?? null);
        }).catch((reason: unknown) => {
            if (active) setError(errorMessage(reason));
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, [query, revision]);

    const refresh = () => {
        setRevision((value) => value + 1);
        void dispatch(fetchEnum('materialTypes'));
    };

    const handleSave = async (name: string) => {
        if (busy || editing === undefined) return;
        setBusy(true);
        try {
            await saveMaterialType(editing?.id ?? null, name);
            setEditing(undefined);
            refresh();
            toast.success('Тип материала сохранён');
        } catch (reason: unknown) {
            toast.error(errorMessage(reason));
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        if (busy || !deleting) return;
        setBusy(true);
        try {
            await deleteMaterialType(deleting.id);
            setDeleting(null);
            refresh();
            toast.success('Тип материала удалён');
        } catch (reason: unknown) {
            toast.error(errorMessage(reason));
        } finally {
            setBusy(false);
        }
    };

    return <>
        <div className="filter-container">
            <div className="filter-search">
                <InputSearch value={search} onChange={setSearch}
                    onEnter={() => setQuery((current) => ({ ...current, page: 1, name: search.trim() }))} />
                <IconButton aria-label="Сбросить поиск" onClick={() => {
                    setSearch('');
                    setQuery((current) => ({ ...current, page: 1, name: '' }));
                }}><MdOutlineRestartAlt /></IconButton>
            </div>
            <div className="filter-actions">
                <Button variant="outlined" startIcon={<MdOutlinePlaylistAdd />} onClick={() => setEditing(null)}>Создать</Button>
            </div>
        </div>
        {loading ? <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box> : error ? (
            <Box p={3}>
                <Typography color="error">{error}</Typography>
                <Button onClick={() => setRevision((value) => value + 1)}>Повторить</Button>
            </Box>
        ) : (
            <div className="table-container">
                <Table className="table" sx={{
                    '&& th:first-of-type, && td:first-of-type': { textAlign: 'center' },
                    '&& th:last-of-type, && td:last-of-type': { textAlign: 'center' },
                }}>
                    <TableHead><TableRow>
                        <TableCell>Название</TableCell><TableCell>Действия</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                        {rows.map((record) => <TableRow key={record.id} onClick={() => setEditing(record)} sx={{ cursor: 'pointer' }}>
                            <TableCell>{record.name}</TableCell>
                            <TableCell>
                                <Box display="flex" justifyContent="center" gap={0.5}>
                                    <IconButton size="small" aria-label="Редактировать" onClick={(event) => {
                                        event.stopPropagation(); setEditing(record);
                                    }}><MdEdit size={18} /></IconButton>
                                    <IconButton size="small" aria-label="Удалить" color="error" onClick={(event) => {
                                        event.stopPropagation(); setDeleting(record);
                                    }}><MdDelete size={18} /></IconButton>
                                </Box>
                            </TableCell>
                        </TableRow>)}
                        {rows.length === 0 && <TableRow><TableCell colSpan={2} align="center">Типы материалов не найдены</TableCell></TableRow>}
                    </TableBody>
                </Table>
                {pagination && <TablePagination pagination={pagination}
                    onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
                    onSizeChange={(size) => setQuery((current) => ({ ...current, page: 1, size }))}
                    showFirstButton showLastButton />}
            </div>
        )}
        {editing !== undefined && <MaterialTypeEditor record={editing} busy={busy}
            onClose={() => setEditing(undefined)} onSave={handleSave} />}
        <ConfirmDialog open={deleting !== null} loading={busy} title="Удалить тип материала?"
            message={`Удалить «${deleting?.name ?? ''}»?`} onConfirm={handleDelete} onCancel={() => setDeleting(null)} />
    </>;
}

function MaterialTypeEditor({ record, busy, onClose, onSave }: {
    record: MaterialType | null;
    busy: boolean;
    onClose: () => void;
    onSave: (name: string) => Promise<void>;
}) {
    const [name, setName] = useState(record?.name ?? '');
    return <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
        <DialogTitle>{record ? 'Редактировать тип материала' : 'Создать тип материала'}</DialogTitle>
        <form onSubmit={(event) => { event.preventDefault(); if (name.trim() && !busy) void onSave(name); }}>
            <DialogContent dividers>
                <TextField autoFocus fullWidth required label="Название" value={name} disabled={busy}
                    onChange={(event) => setName(event.target.value)} size="small" />
            </DialogContent>
            <DialogActions>
                <Button disabled={busy} onClick={onClose}>Отмена</Button>
                <Button type="submit" variant="contained" disabled={busy || !name.trim()}>{busy ? 'Сохранение…' : 'Сохранить'}</Button>
            </DialogActions>
        </form>
    </Dialog>;
}
