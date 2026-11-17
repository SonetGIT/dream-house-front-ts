import { useEffect, useState } from 'react';
import {
    Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Tab, Tabs, Table, TableBody, TableCell, TableHead, TableRow,
    TextField, Typography,
} from '@mui/material';
import { MdDelete, MdEdit, MdOutlinePlaylistAdd, MdOutlineRestartAlt } from 'react-icons/md';
import toast from 'react-hot-toast';
import InputSearch from '@/components/ui/InputSearch';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { TablePagination } from '@/components/ui/TablePagination';
import { useReference } from '@/features/reference/useReference';
import { fetchEnum } from '@/features/reference/referenceSlice';
import { useAppDispatch } from '@/app/store';
import type { Pagination } from '@/features/users/userSlice';
import { deleteDirectoryRecord, saveDirectoryRecord, searchDirectory } from './servicesApi';
import type { ServiceDirectory, ServiceQuery, ServiceRecord } from './servicesApi';

const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Ошибка запроса';

export default function ServicesPage() {
    const [directory, setDirectory] = useState<ServiceDirectory>('services');
    return (
        <>
            <Tabs value={directory} onChange={(_, value: ServiceDirectory) => setDirectory(value)}>
                <Tab value="services" label="Услуги" />
                <Tab value="serviceTypes" label="Типы услуг" />
            </Tabs>
            <ServiceDirectoryPage key={directory} directory={directory} />
        </>
    );
}

function ServiceDirectoryPage({ directory }: { directory: ServiceDirectory }) {
    const dispatch = useAppDispatch();
    const isService = directory === 'services';
    const serviceTypes = useReference('serviceTypes');
    const units = useReference('unitsOfMeasure');
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState<ServiceQuery>({ page: 1, size: 10, search: '' });
    const [rows, setRows] = useState<ServiceRecord[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);
    const [editing, setEditing] = useState<ServiceRecord | null | undefined>(undefined);
    const [deleteRecord, setDeleteRecord] = useState<ServiceRecord | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        searchDirectory(directory, query).then((response) => {
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
    }, [directory, query, revision]);

    const refresh = () => {
        setRevision((value) => value + 1);
        void dispatch(fetchEnum(directory));
    };

    const handleSave = async (name: string, serviceType: number | '') => {
        if (editing === undefined || busy) return;
        setBusy(true);
        try {
            await saveDirectoryRecord(directory, editing?.id ?? null, {
                name: name.trim(),
                ...(isService && serviceType !== '' ? { service_type: serviceType } : {}),
            });
            setEditing(undefined);
            refresh();
            toast.success('Запись сохранена');
        } catch (reason: unknown) {
            toast.error(errorMessage(reason));
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteRecord || busy) return;
        setBusy(true);
        try {
            await deleteDirectoryRecord(directory, deleteRecord.id);
            setDeleteRecord(null);
            refresh();
            toast.success('Запись удалена');
        } catch (reason: unknown) {
            toast.error(errorMessage(reason));
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <div className="filter-container">
                <div className="filter-search">
                    <InputSearch value={search} onChange={setSearch} onEnter={() => setQuery((current) => ({ ...current, page: 1, search: search.trim() }))} />
                    {isService && <ReferenceSelect label="Тип услуги" value={query.service_type ?? ''} options={serviceTypes.data ?? []} loading={serviceTypes.loading} onChange={(value) => setQuery((current) => ({ ...current, page: 1, service_type: value === '' ? undefined : Number(value) }))} />}
                    <IconButton aria-label="Сбросить фильтры и поиск" onClick={() => { setSearch(''); setQuery((current) => ({ page: 1, size: current.size, search: '' })); }}><MdOutlineRestartAlt /></IconButton>
                </div>
                <div className="filter-actions">
                    <Button variant="outlined" startIcon={<MdOutlinePlaylistAdd />} onClick={() => setEditing(null)}>Создать</Button>
                </div>
            </div>
            {loading ? <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box> : error ? (
                <Box p={3}><Typography color="error">{error}</Typography><Button onClick={() => setRevision((value) => value + 1)}>Повторить</Button></Box>
            ) : (
                <div className="table-container">
                    <Table className="table" sx={{
                        '&& th:first-of-type, && td:first-of-type': {
                            textAlign: 'left',
                            paddingLeft: '16px',
                        },
                        '&& th:last-of-type, && td:last-of-type': { textAlign: 'center' },
                    }}>
                        <TableHead><TableRow>
                            <TableCell>Название</TableCell>
                            {isService && <TableCell>Тип услуги</TableCell>}
                            {isService && <TableCell>Ед. изм.</TableCell>}
                            <TableCell>Действия</TableCell>
                        </TableRow></TableHead>
                        <TableBody>
                            {rows.map((record) => <TableRow key={record.id} onClick={() => setEditing(record)} sx={{ cursor: 'pointer' }}>
                                <TableCell>{record.name}</TableCell>
                                {isService && <TableCell align="center">{record.service_type == null ? '—' : serviceTypes.lookup(record.service_type)}</TableCell>}
                                {isService && <TableCell align="center">{record.unit_of_measure == null ? '—' : units.lookup(record.unit_of_measure)}</TableCell>}
                                <TableCell>
                                    <Box display="flex" justifyContent="center" alignItems="center" gap={0.5}>
                                        <IconButton size="small" aria-label="Редактировать" onClick={(event) => { event.stopPropagation(); setEditing(record); }}><MdEdit size={18} /></IconButton>
                                        <IconButton size="small" aria-label="Удалить" color="error" onClick={(event) => { event.stopPropagation(); setDeleteRecord(record); }}><MdDelete size={18} /></IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>)}
                            {rows.length === 0 && <TableRow><TableCell colSpan={isService ? 4 : 2} align="center">Записи не найдены</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                    {pagination && <TablePagination pagination={pagination} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} onSizeChange={(size) => setQuery((current) => ({ ...current, page: 1, size }))} showFirstButton showLastButton />}
                </div>
            )}
            {editing !== undefined && <ServiceEditor record={editing} isService={isService} busy={busy} onClose={() => setEditing(undefined)} onSave={handleSave} />}
            <ConfirmDialog open={deleteRecord !== null} loading={busy} title={isService ? 'Удалить услугу?' : 'Удалить тип услуги?'} message={`Удалить «${deleteRecord?.name ?? ''}»?`} onConfirm={handleDelete} onCancel={() => setDeleteRecord(null)} />
        </>
    );
}

function ServiceEditor({ record, isService, busy, onClose, onSave }: {
    record: ServiceRecord | null;
    isService: boolean;
    busy: boolean;
    onClose: () => void;
    onSave: (name: string, serviceType: number | '') => Promise<void>;
}) {
    const serviceTypes = useReference('serviceTypes');
    const [name, setName] = useState(record?.name ?? '');
    const [serviceType, setServiceType] = useState<number | ''>(record?.service_type ?? '');
    return <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
        <DialogTitle>{record ? 'Редактирование' : 'Создание'} {isService ? 'услуги' : 'типа услуги'}</DialogTitle>
        <form onSubmit={(event) => { event.preventDefault(); if (name.trim() && (!isService || serviceType !== '')) void onSave(name, serviceType); }}>
            <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField autoFocus required label="Название" value={name} disabled={busy} onChange={(event) => setName(event.target.value)} size="small" />
                    {isService && <ReferenceSelect label="Тип услуги" value={serviceType} options={serviceTypes.data ?? []} loading={serviceTypes.loading} disabled={busy} onChange={(value) => setServiceType(value === '' ? '' : Number(value))} />}
                    {isService && serviceTypes.error && <Typography color="error">{serviceTypes.error}</Typography>}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button disabled={busy} onClick={onClose}>Отмена</Button>
                <Button type="submit" variant="contained" disabled={busy || !name.trim() || (isService && serviceType === '')}>{busy ? 'Сохранение…' : 'Сохранить'}</Button>
            </DialogActions>
        </form>
    </Dialog>;
}
