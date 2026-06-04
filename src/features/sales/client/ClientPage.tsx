import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, Users, X } from 'lucide-react';
import { Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { TablePagination } from '@/components/ui/TablePagination';
import Modal from '@/components/ui/Modal';
import { useReference } from '@/features/reference/useReference';
import { Add } from '@mui/icons-material';
import ClientTable from './ClientTable';
import {
    createSalesClient,
    fetchSalesClients,
    updateSalesClient,
    type SalesClient,
    type SalesClientCreatePayload,
    type SalesClientUpdatePayload,
} from '../slices/salesClientsSlice';
import ClientForm from './ClientForm';
import InputSearch from '@/components/ui/InputSearch';
import ClientDetail from './ClientDetail';

interface FiltersState {
    search: string;
    payment_type: number | null;
    status: number | null;
    article_id: number | null;
    dateFrom: string;
    dateTo: string;
}

export const lotTypeMap: Record<string, string> = {
    apartment: 'Квартира',
    parking: 'Паркинг',
    storage: 'Кладовая',
    commercial: 'Коммерция',
};
type Modal =
    | { type: 'detail'; client: SalesClient }
    | { type: 'create' }
    | { type: 'edit'; client: SalesClient };

/**************************************************************************************************************************************/
export default function ClientPage() {
    const dispatch = useAppDispatch();
    const { items: clients, pagination, loading, error } = useAppSelector((s) => s.salesClients);
    const { items: projects } = useAppSelector((s) => s.projects);
    const { data: blocks } = useAppSelector((s) => s.projectBlocks);

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [searchInput, setSearchInput] = useState('');
    const [filterSearch, setFilterSearch] = useState('');
    const [filterProject, setFilterProject] = useState('');
    const [filterBlock, setFilterBlock] = useState('');
    const [modal, setModal] = useState<Modal | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const users = useReference('users');
    const refs = {
        users,
    };

    const filteredBlocks = useMemo(
        () => blocks?.filter((b) => !filterProject || b.project_id === Number(filterProject)) ?? [],
        [filterProject, blocks],
    );

    const load = useCallback(
        (p: number, search: string, projectId: string, blockId: string) => {
            dispatch(
                fetchSalesClients({
                    search: search || undefined,
                    project_id: projectId ? Number(projectId) : undefined,
                    block_id: blockId ? Number(blockId) : undefined,
                    page: p,
                    size: size,
                }),
            );
        },
        [dispatch, size],
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

    /*********************************************************************************************************************/
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
            <div className="mx-auto max-w-[1800px] px-6 py-3">
                <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-sky-800">Клиенты</h1>
                        <p className="text-sm text-sky-700">
                            Панель управление клиентами, их контактами.
                        </p>
                    </div>
                </div>
                {/* ФИЛЬТРЫ */}
                <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-sm">
                    <header className="z-10 border-b shrink-0 border-border bg-card/80 backdrop-blur-sm">
                        <div className="flex items-center gap-3 px-5 h-14">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Users className="w-4 h-4 text-blue-700" />
                                <span className="text-blue-600">
                                    Всего клиентов:{' '}
                                    <strong className="text-blue-700 text-foreground">
                                        {clients.length}
                                    </strong>
                                </span>
                            </div>
                            <div className="flex-1" />

                            <div className="flex flex-wrap items-center gap-2 ml-auto">
                                <InputSearch
                                    value={searchInput}
                                    onChange={(value) => {
                                        setSearchInput(value);
                                        if (!value.trim()) {
                                            setFilterSearch('');
                                        }
                                    }}
                                    onEnter={() => setFilterSearch(searchInput.trim())}
                                    placeholder="Поиск по ФИО, тел., email или ПИН"
                                />

                                <select
                                    value={filterProject || 'all'}
                                    onChange={(e) => {
                                        const value =
                                            e.target.value === 'all' ? '' : e.target.value;
                                        setFilterProject(value);
                                    }}
                                    className="h-[37px] min-w-48 rounded-md border border-blue-200 bg-white px-3 text-sm text-slate-700 transition hover:border-[#8eb9ed] hover:bg-[#f5fbff]"
                                >
                                    <option value="all">Все объекты</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={String(project.id)}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>

                                <Button
                                    variant="outlined"
                                    className="gap-2 !border-rose-300 !text-rose-600 hover:!bg-rose-600 hover:!text-white"
                                    onClick={() => {
                                        setSearchInput('');
                                        setFilterSearch('');
                                        setFilterProject('');
                                    }}
                                    disabled={loading}
                                >
                                    <RefreshCw
                                        className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                                    />
                                    Сбросить
                                </Button>

                                <Button
                                    variant="outlined"
                                    className="inline-flex items-center text-sm font-medium text-white transition bg-blue-600 rounded-lg h-9 hover:bg-blue-600 hover:text-white"
                                    startIcon={<Add />}
                                    onClick={() => setModal({ type: 'create' })}
                                >
                                    Создать клиента
                                </Button>
                            </div>
                        </div>
                    </header>
                </div>
                <div className="overflow-hidden bg-white border shadow-sm">
                    <ClientTable
                        clients={clients}
                        refs={refs}
                        loading={loading}
                        selectedId={selectedId}
                        setModal={setModal}
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
            </div>

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
                                    projects={projects}
                                    blocks={blocks}
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
