import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { Box, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { TablePagination } from '@/components/ui/TablePagination';
import Modal from '@/components/ui/Modal';
import { useReference } from '@/features/reference/useReference';
import ClientsTable from './ClientTable';
import { Add } from '@mui/icons-material';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import ClientTable from './ClientTable';
import {
    createSalesClient,
    fetchSalesClients,
    updateSalesClient,
    type SalesClient,
    type SalesClientCreatePayload,
    type SalesClientSearchPayload,
    type SalesClientUnitStatus,
    type SalesClientUpdatePayload,
} from '../slices/salesClientsSlice';
import ClientForm from './ClientForm';
import InputSearch from '@/components/ui/InputSearch';

type ModalMode = 'create' | 'edit' | 'view' | 'delete' | null;

interface FiltersState {
    search: string;
    payment_type: number | null;
    status: number | null;
    article_id: number | null;
    dateFrom: string;
    dateTo: string;
}

const initialFilters: FiltersState = {
    search: '',
    payment_type: null,
    status: null,
    article_id: null,
    dateFrom: '',
    dateTo: '',
};
export const lotTypeMap: Record<string, string> = {
    apartment: 'Квартира',
    parking: 'Паркинг',
    storage: 'Кладовая',
    commercial: 'Коммерция',
};
export default function ClientPage() {
    const dispatch = useAppDispatch();
    const { projectId, prjBlockId } = useParams();

    const projectIdNum = projectId ? Number(projectId) : null;
    const blockIdNum = prjBlockId ? Number(prjBlockId) : null;

    // const { salesClients } = useAppSelector((state) => state.salesClients);
    const {
        items,
        pagination,
        loading,
        // submitting,
        // types,
        // statuses,
        // articles,
        // methods,
        // current,
        // counterpartyTypes,
    } = useAppSelector((state) => state.salesClients);
    const users = useReference('users');
    const currencies = useReference('currencies');
    const projectBlocks = useReference('projectBlocks');
    const suppliers = useReference('suppliers');
    const contractors = useReference('contractors');

    const refs = {
        users,
        currencies,
        projectBlocks,
        suppliers,
        contractors,
    };

    const [filters, setFilters] = useState<FiltersState>(initialFilters);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [modal, setModal] = useState<ModalMode>(null);
    const [selectedClient, setSelectedClient] = useState<SalesClient | null>(null);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearch(filters.search.trim());
        }, 350);

        return () => window.clearTimeout(timeoutId);
    }, [filters.search]);

    // useEffect(() => {
    //     if (!types.length) dispatch(fetchClientTypes());
    //     if (!statuses.length) dispatch(fetchClientStatuses());
    //     if (!articles.length) dispatch(fetchClientArticles());
    //     if (!methods.length) dispatch(fetchClientMethods());
    //     if (!counterpartyTypes.length) dispatch(paymentCounterpartyTypes());
    // }, [
    //     dispatch,
    //     types.length,
    //     statuses.length,
    //     articles.length,
    //     methods.length,
    //     counterpartyTypes.length,
    // ]);

    // useEffect(() => {
    //     return () => {
    //         dispatch(clearClients());
    //     };
    // }, [dispatch]);

    // useEffect(() => {
    //     setPage(1);
    // }, [
    //     debouncedSearch,
    //     filters.payment_type,
    //     filters.status,
    //     filters.article_id,
    //     filters.dateFrom,
    //     filters.dateTo,
    //     // projectIdNum,
    //     // salesClients?.id,
    //     // blockIdNum,
    // ]);

    const requestParams = useMemo<SalesClientSearchPayload>(
        () => ({
            page,
            size,
            search: debouncedSearch || undefined,
            // project_id: projectIdNum ?? salesClients?.id ?? undefined,
            // block_id: blockIdNum ?? undefined,
            payment_type: filters.payment_type ?? undefined,
            status: filters.status ?? undefined,
            article_id: filters.article_id ?? undefined,
            dateFrom: filters.dateFrom || undefined,
            dateTo: filters.dateTo || undefined,
        }),
        [
            page,
            size,
            debouncedSearch,
            // projectIdNum,
            // salesClients?.id,
            // blockIdNum,
            filters.payment_type,
            filters.status,
            filters.article_id,
            filters.dateFrom,
            filters.dateTo,
        ],
    );

    useEffect(() => {
        dispatch(fetchSalesClients(requestParams));
    }, [dispatch, requestParams]);

    const refetchClients = (nextPage = page, nextSize = size) => {
        dispatch(
            fetchSalesClients({
                ...requestParams,
                page: nextPage,
                size: nextSize,
            }),
        );
    };

    const handleFilterChange = <K extends keyof FiltersState>(field: K, value: FiltersState[K]) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleResetFilters = () => {
        setFilters(initialFilters);
    };

    const handleCreate = () => {
        setSelectedClient(null);
        // dispatch(setCurrentClient(null));
        setModal('create');
    };

    const handleView = (payment: SalesClient) => {
        setSelectedClient(payment);
        // dispatch(setCurrentClient(payment));
        setModal('view');
    };

    const handleEdit = (payment: SalesClient) => {
        setSelectedClient(payment);
        // dispatch(setCurrentClient(payment));
        setModal('edit');
    };

    const handleDelete = (payment: SalesClient) => {
        setSelectedClient(payment);
        // dispatch(setCurrentClient(payment));
        setModal('delete');
    };

    const closeModal = () => {
        setModal(null);
    };

    const closeAndResetSelection = () => {
        setSelectedClient(null);
        // dispatch(setCurrentClient(null));
        closeModal();
    };

    const handleCreateClient = async (payload: SalesClientCreatePayload) => {
        try {
            await dispatch(createSalesClient(payload as SalesClientCreatePayload)).unwrap();
            toast.success('Клиент успешно создан');
            closeAndResetSelection();
            setPage(1);
            refetchClients(1, size);
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Не удалось создать клиента');
        }
    };

    const handleUpdateClient = async (payload: SalesClientUpdatePayload) => {
        if (!selectedClient) return;

        try {
            await dispatch(
                updateSalesClient({
                    id: selectedClient.id,
                    payload: payload as SalesClientUpdatePayload,
                }),
            ).unwrap();
            toast.success('Клиент обновлен');
            closeAndResetSelection();
            refetchClients();
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Не удалось обновить клиента');
        }
    };

    // const handleDeleteClient = async () => {
    //     if (!selectedClient) return;

    //     try {
    //         await dispatch(deleteClient(selectedClient.id)).unwrap();
    //         toast.success('Платеж удален');

    //         const isLastItemOnPage = data.length === 1 && page > 1;
    //         const nextPage = isLastItemOnPage ? page - 1 : page;

    //         closeAndResetSelection();
    //         setPage(nextPage);
    //         refetchClients(nextPage, size);
    //     } catch (error) {
    //         toast.error(typeof error === 'string' ? error : 'Не удалось удалить платеж');
    //     }
    // };

    // const filteredArticles = useMemo(() => {
    //     if (!filters.payment_type) return articles;
    //     return articles.filter((article) => article.payment_type === filters.payment_type);
    // }, [articles, filters.payment_type]);

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
                                <Filter className="w-4 h-4 text-blue-700" />
                                <span className="text-blue-600">
                                    Всего клиентов:{' '}
                                    <strong className="text-blue-700 text-foreground">
                                        {clients.length}
                                    </strong>
                                </span>
                                {leadStatuses.map((status) => {
                                    const count = totals[Number(status.id)] ?? 0;
                                    if (!count) return null;

                                    return (
                                        <span key={status.id} className="flex items-center gap-1">
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{
                                                    backgroundColor: status.color || '#eb1616',
                                                }}
                                            />
                                            {count}
                                        </span>
                                    );
                                })}
                            </div>

                            <div className="flex-1" />

                            <div className="flex flex-wrap items-center gap-2 m-4">
                                <InputSearch
                                    value={searchInput}
                                    onChange={(value) => {
                                        setSearchInput(value);
                                        if (!value.trim()) {
                                            setFilterSearch('');
                                        }
                                    }}
                                    onEnter={() => setFilterSearch(searchInput.trim())}
                                />

                                <select
                                    value={filterProject || 'all'}
                                    onChange={(e) => {
                                        const value =
                                            e.target.value === 'all' ? '' : e.target.value;
                                        setFilterProject(value);
                                        setFilterBlock('');
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
                                    onClick={() => setLeadDialog({ open: true, lead: null })}
                                >
                                    Новый лид
                                </Button>
                            </div>
                        </div>
                    </header>
                </div>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button variant="outlined" startIcon={<Add />} onClick={handleCreate}>
                        Создать клиента
                    </Button>
                </Box>
                <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
                    <ClientTable
                        clients={items}
                        refs={refs}
                        loading={loading}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
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

            {/* <Modal
                isOpen={modal === 'create'}
                onClose={closeAndResetSelection}
                title="Создать платеж"
            >
                <ClientForm
                    mode="create"
                    projectId={projectIdNum ?? currentProject?.id ?? null}
                    blockId={blockIdNum}
                    refs={refs}
                    loading={submitting}
                    onSubmit={handleCreateClient}
                    onCancel={closeAndResetSelection}
                />
            </Modal>
            
            <Modal
                isOpen={modal === 'edit' && Boolean(selectedClient)}
                onClose={closeAndResetSelection}
                title="Редактировать платеж"
            >
                {selectedClient && (
                    <ClientForm
                        mode="edit"
                        payment={selectedClient}
                        projectId={selectedClient.project_id}
                        blockId={selectedClient.block_id}
                        refs={refs}
                        loading={submitting}
                        onSubmit={handleUpdateClient}
                        onCancel={closeAndResetSelection}
                    />
                )}
            </Modal>

            <Modal
                isOpen={modal === 'view' && Boolean(current ?? selectedClient)}
                onClose={closeAndResetSelection}
                title="Карточка платежа"
            >
                {(current ?? selectedClient) && (
                    <ClientDetail
                        payment={(current ?? selectedClient)!}
                        onEdit={() => setModal('edit')}
                        onClose={closeAndResetSelection}
                    />
                )}
            </Modal> */}

            {/* <ConfirmDialogNew
                isOpen={modal === 'delete' && Boolean(selectedClient)}
                onClose={closeAndResetSelection}
                onConfirm={handleDeleteClient}
                title="Удалить платеж?"
                message={`Вы уверены, что хотите удалить платеж "${selectedClient?.title}"?`}
                confirmText="Удалить"
                cancelText="Отмена"
                variant="danger"
                loading={submitting}
            /> */}
        </div>
    );
}
