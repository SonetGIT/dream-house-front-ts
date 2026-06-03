import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    MessageCircle,
    Phone,
    Plus,
    RefreshCw,
    Search,
    UserCheck,
    X,
    Lock,
    Box,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import ClientDetail from './ClientDetail';
import ClientForm from './ClientForm';
import {
    createSalesClient,
import Button from 'node_modules/@mui/material/esm/Button/Button';
    fetchSalesClients,
    updateSalesClient,
    type SalesClient,
    type SalesClientCreatePayload,
    type SalesClientUpdatePayload,
} from '../slices/salesClientsSlice';
import toast from 'react-hot-toast';
import ClientTable from './ClientTable';
import { TablePagination } from '@/components/ui/TablePagination';
import { useReference } from '@/features/reference/useReference';
import { Add } from '@mui/icons-material';

function UnitStatusBadge({ status }: { status: { name: string; color: string } }) {
    return (
        <span
            className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap"
            style={{
                backgroundColor: status.color + '18',
                color: status.color,
                borderColor: status.color + '40',
            }}
        >
            {status.name}
        </span>
    );
}

function ClientBadge() {
    return (
        <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
            Клиент
        </span>
    );
}

type Modal =
    | { type: 'detail'; client: SalesClient }
    | { type: 'create' }
    | { type: 'edit'; client: SalesClient };

export default function ClientsPage() {
    const dispatch = useAppDispatch();
    const { items: clients, pagination, loading, error } = useAppSelector((s) => s.salesClients);
    const { items: projects } = useAppSelector((s) => s.projects);
    const { data: blocks } = useAppSelector((s) => s.projectBlocks);

    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [filterSearch, setFilterSearch] = useState('');
    const [filterProject, setFilterProject] = useState('');
    const [filterBlock, setFilterBlock] = useState('');
    const [modal, setModal] = useState<Modal | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    const pag = pagination ?? { page: 1, pages: 1, total: 0, hasNext: false, hasPrev: false };

    const filteredBlocks = useMemo(
        () => blocks.filter((b) => !filterProject || b.project_id === Number(filterProject)),
        [filterProject],
    );
    const users = useReference('users');
    //     const currencies = useReference('currencies');
    //     const projectBlocks = useReference('projectBlocks');
    //     const suppliers = useReference('suppliers');
    //     const contractors = useReference('contractors');

    const refs = {
        users,
        // currencies,
        // projectBlocks,
        // suppliers,
        // contractors,
    };
    const load = useCallback(
        (p: number, search: string, projectId: string, blockId: string) => {
            dispatch(
                fetchSalesClients({
                    search: search || undefined,
                    project_id: projectId ? Number(projectId) : undefined,
                    block_id: blockId ? Number(blockId) : undefined,
                    page: p,
                    size: 10,
                }),
            );
        },
        [dispatch],
    );

    useEffect(() => {
        load(page, filterSearch, filterProject, filterBlock);
    }, [page, filterSearch, filterProject, filterBlock, load]);

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    const applySearch = () => {
        setPage(1);
        setFilterSearch(searchInput.trim());
    };

    const handleProjectChange = (v: string) => {
        setFilterProject(v);
        setFilterBlock('');
        setPage(1);
    };

    const handleCreate = async (data: SalesClientCreatePayload | SalesClientUpdatePayload) => {
        setSubmitting(true);
        try {
            await dispatch(createSalesClient(data as SalesClientCreatePayload)).unwrap();
            toast.success('Клиент создан');
            setModal(null);
            load(page, filterSearch, filterProject, filterBlock);
        } catch (e) {
            toast.error(e as string);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (
        id: number,
        data: SalesClientCreatePayload | SalesClientUpdatePayload,
    ) => {
        setSubmitting(true);
        try {
            const updated = await dispatch(
                updateSalesClient({ id, payload: data as SalesClientUpdatePayload }),
            ).unwrap();
            toast.success('Клиент обновлён');
            setModal({ type: 'detail', client: updated });
        } catch (e) {
            toast.error(e as string);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedId = modal?.type === 'detail' ? modal.client.id : null;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            {/* Header */}
            <div className="px-6 py-3 border-b shrink-0 border-border bg-card">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <UserCheck className="w-5 h-5 text-emerald-500" />
                        <div>
                            <h1 className="text-sm font-semibold">Клиенты</h1>
                            <p className="text-xs text-muted-foreground">
                                {loading ? 'Загрузка...' : `${pag.total} клиентов`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                ref={searchRef}
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                                placeholder="Имя, телефон, паспорт..."
                                className="w-64 h-8 pl-8 pr-3 text-xs border rounded-lg border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>

                        <select
                            value={filterProject}
                            onChange={(e) => handleProjectChange(e.target.value)}
                            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs focus:outline-none"
                        >
                            <option value="">Все объекты</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filterBlock}
                            onChange={(e) => {
                                setFilterBlock(e.target.value);
                                setPage(1);
                            }}
                            disabled={!filterProject}
                            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs focus:outline-none disabled:opacity-50"
                        >
                            <option value="">Все блоки</option>
                            {filteredBlocks.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => load(page, filterSearch, filterProject, filterBlock)}
                            disabled={loading}
                            className="flex items-center justify-center w-8 h-8 transition-colors border rounded-lg border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" startIcon={<Add />} onClick={handleCreate}>
                    Создать клиента
                </Button>
            </Box>
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
                <ClientTable
                    clients={clients}
                    refs={refs}
                    loading={loading}
                    // onView={handleView}
                    // onEdit={handleEdit}
                    // onDelete={handleDelete}
                />

                {pagination && (
                    <TablePagination
                        pagination={pagination}
                        onPageChange={(newPage) => {
                            setPage(newPage);
                        }}
                        onSizeChange={(newSize) => {
                            setPage(1);
                            setSize(newSize);
                        }}
                        sizeOptions={[10, 25, 50, 100]}
                        showFirstButton
                        showLastButton
                    />
                )}
            </div>

            {/* Detail modal */}
            {modal?.type === 'detail' && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30"
                        onClick={() => setModal(null)}
                    />
                    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
                            <span className="text-sm font-semibold text-gray-900">
                                Карточка клиента
                            </span>
                            <button
                                onClick={() => setModal(null)}
                                className="flex items-center justify-center w-8 h-8 text-gray-400 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6">
                            <ClientDetail
                                client={modal.client}
                                onEdit={() => setModal({ type: 'edit', client: modal.client })}
                                onClose={() => setModal(null)}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Create / Edit modal */}
            {(modal?.type === 'create' || modal?.type === 'edit') && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/40"
                        onClick={() => !submitting && setModal(null)}
                    />
                    <div className="fixed inset-0 z-50 flex items-start justify-center py-10 overflow-y-auto">
                        <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h2 className="text-sm font-semibold text-gray-900">
                                    {modal.type === 'create'
                                        ? 'Новый клиент'
                                        : 'Редактировать клиента'}
                                </h2>
                                <button
                                    onClick={() => !submitting && setModal(null)}
                                    className="flex items-center justify-center w-8 h-8 text-gray-400 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-6">
                                <ClientForm
                                    mode={modal.type}
                                    client={modal.type === 'edit' ? modal.client : null}
                                    projects={PROJECTS}
                                    blocks={BLOCKS}
                                    loading={submitting}
                                    onSubmit={
                                        modal.type === 'create'
                                            ? handleCreate
                                            : (data) => handleUpdate(modal.client.id, data)
                                    }
                                    onCancel={() => setModal(null)}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
