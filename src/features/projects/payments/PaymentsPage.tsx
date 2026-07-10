import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RotateCcw, Search } from 'lucide-react';
import { Box, Button } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { TablePagination } from '@/components/ui/TablePagination';
import Modal from '@/components/ui/Modal';
import { useReference } from '@/features/reference/useReference';
import PaymentDetail from './PaymentDetail';
import PaymentForm from './PaymentForm';
import PaymentsTable from './PaymentsTable';
import {
    clearPayments,
    createPayment,
    // deletePayment,
    fetchPaymentArticles,
    fetchPaymentMethods,
    fetchPayments,
    fetchPaymentStatuses,
    fetchPaymentTypes,
    paymentCounterpartyTypes,
    setCurrentPayment,
    updatePayment,
    type Payment,
    type PaymentCreatePayload,
    type PaymentSearchParams,
    type PaymentUpdatePayload,
} from './paymentSlice';
import { Add } from '@mui/icons-material';
import { StyledTooltip } from '@/components/ui/StyledTooltip';

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

export default function PaymentsPage() {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { projectId, prjBlockId } = useParams();

    const projectIdNum = projectId ? Number(projectId) : null;
    const blockIdNum = prjBlockId ? Number(prjBlockId) : null;

    const { currentProject } = useAppSelector((state) => state.projects);
    const {
        data,
        pagination,
        loading,
        submitting,
        types,
        statuses,
        articles,
        methods,
        current,
        counterpartyTypes,
    } = useAppSelector((state) => state.payments);

    const currencies = useReference('currencies');
    const projectBlocks = useReference('projectBlocks');
    const suppliers = useReference('suppliers');
    const contractors = useReference('contractors');

    const refs = {
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
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const focusId = useMemo(() => {
        const value = Number(new URLSearchParams(location.search).get('focus'));
        return Number.isInteger(value) && value > 0 ? value : null;
    }, [location.search]);

    const clearFocusFromUrl = useCallback(() => {
        const searchParams = new URLSearchParams(location.search);

        if (!searchParams.has('focus')) return;

        searchParams.delete('focus');
        navigate(
            {
                pathname: location.pathname,
                search: searchParams.toString() ? `?${searchParams.toString()}` : '',
            },
            { replace: true },
        );
    }, [location.pathname, location.search, navigate]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearch(filters.search.trim());
        }, 350);

        return () => window.clearTimeout(timeoutId);
    }, [filters.search]);

    useEffect(() => {
        if (!types.length) dispatch(fetchPaymentTypes());
        if (!statuses.length) dispatch(fetchPaymentStatuses());
        if (!articles.length) dispatch(fetchPaymentArticles());
        if (!methods.length) dispatch(fetchPaymentMethods());
        if (!counterpartyTypes.length) dispatch(paymentCounterpartyTypes());
    }, [
        dispatch,
        types.length,
        statuses.length,
        articles.length,
        methods.length,
        counterpartyTypes.length,
    ]);

    useEffect(() => {
        return () => {
            dispatch(clearPayments());
        };
    }, [dispatch]);

    useEffect(() => {
        setPage(1);
    }, [
        debouncedSearch,
        filters.payment_type,
        filters.status,
        filters.article_id,
        filters.dateFrom,
        filters.dateTo,
        projectIdNum,
        currentProject?.id,
        blockIdNum,
    ]);

    const requestParams = useMemo<PaymentSearchParams>(
        () =>
            focusId
                ? {
                      id: focusId,
                      page: 1,
                      size,
                      project_id: projectIdNum ?? currentProject?.id ?? undefined,
                      block_id: blockIdNum ?? undefined,
                  }
                : {
                      page,
                      size,
                      search: debouncedSearch || undefined,
                      project_id: projectIdNum ?? currentProject?.id ?? undefined,
                      block_id: blockIdNum ?? undefined,
                      payment_type: filters.payment_type ?? undefined,
                      status: filters.status ?? undefined,
                      article_id: filters.article_id ?? undefined,
                      dateFrom: filters.dateFrom || undefined,
                      dateTo: filters.dateTo || undefined,
                  },
        [
            focusId,
            page,
            size,
            debouncedSearch,
            projectIdNum,
            currentProject?.id,
            blockIdNum,
            filters.payment_type,
            filters.status,
            filters.article_id,
            filters.dateFrom,
            filters.dateTo,
        ],
    );

    useEffect(() => {
        dispatch(fetchPayments(requestParams));
    }, [dispatch, requestParams]);

    const refetchPayments = (nextPage = page, nextSize = size) => {
        dispatch(
            fetchPayments({
                ...requestParams,
                page: nextPage,
                size: nextSize,
            }),
        );
    };

    const handleFilterChange = <K extends keyof FiltersState>(field: K, value: FiltersState[K]) => {
        clearFocusFromUrl();
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleResetFilters = () => {
        clearFocusFromUrl();
        setFilters(initialFilters);
    };

    const handleCreate = () => {
        setSelectedPayment(null);
        dispatch(setCurrentPayment(null));
        setModal('create');
    };

    const handleView = (payment: Payment) => {
        setSelectedPayment(payment);
        dispatch(setCurrentPayment(payment));
        setModal('view');
    };

    const handleEdit = (payment: Payment) => {
        setSelectedPayment(payment);
        dispatch(setCurrentPayment(payment));
        setModal('edit');
    };

    const handleDelete = (payment: Payment) => {
        setSelectedPayment(payment);
        dispatch(setCurrentPayment(payment));
        setModal('delete');
    };

    const closeModal = () => {
        setModal(null);
    };

    const closeAndResetSelection = () => {
        setSelectedPayment(null);
        dispatch(setCurrentPayment(null));
        closeModal();
    };

    const handleCreatePayment = async (payload: PaymentCreatePayload | PaymentUpdatePayload) => {
        try {
            await dispatch(createPayment(payload as PaymentCreatePayload)).unwrap();
            toast.success('Платеж успешно создан');
            closeAndResetSelection();
            setPage(1);
            refetchPayments(1, size);
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Не удалось создать платеж');
        }
    };

    const handleUpdatePayment = async (payload: PaymentCreatePayload | PaymentUpdatePayload) => {
        if (!selectedPayment) return;

        try {
            await dispatch(
                updatePayment({
                    id: selectedPayment.id,
                    data: payload as PaymentUpdatePayload,
                }),
            ).unwrap();
            toast.success('Платеж обновлен');
            closeAndResetSelection();
            refetchPayments();
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Не удалось обновить платеж');
        }
    };

    // const handleDeletePayment = async () => {
    //     if (!selectedPayment) return;

    //     try {
    //         await dispatch(deletePayment(selectedPayment.id)).unwrap();
    //         toast.success('Платеж удален');

    //         const isLastItemOnPage = data.length === 1 && page > 1;
    //         const nextPage = isLastItemOnPage ? page - 1 : page;

    //         closeAndResetSelection();
    //         setPage(nextPage);
    //         refetchPayments(nextPage, size);
    //     } catch (error) {
    //         toast.error(typeof error === 'string' ? error : 'Не удалось удалить платеж');
    //     }
    // };

    const filteredArticles = useMemo(() => {
        if (!filters.payment_type) return articles;
        return articles.filter((article) => article.payment_type === filters.payment_type);
    }, [articles, filters.payment_type]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
            <div className="mx-auto max-w-[1800px] px-6 py-3">
                <div className="p-4 mb-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-8">
                        <div className="xl:col-span-2">
                            <label className="mb-1.5 block text-sm text-left font-medium text-blue-600">
                                Поиск
                            </label>
                            <div className="relative">
                                <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(event) =>
                                        handleFilterChange('search', event.target.value)
                                    }
                                    placeholder="Название, контрагент, номер документа..."
                                    className="w-full py-2 pr-3 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg pl-9 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                />
                            </div>
                        </div>

                        <div className="w-[180px] shrink-0">
                            <label className="mb-1.5 text-left block text-sm font-medium text-blue-600">
                                Тип платежа
                            </label>
                            <select
                                value={filters.payment_type ?? ''}
                                onChange={(event) =>
                                    handleFilterChange(
                                        'payment_type',
                                        event.target.value ? Number(event.target.value) : null,
                                    )
                                }
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            >
                                <option value="">Все типы</option>
                                {types.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-[180px] text-left shrink-0">
                            <label className="mb-1.5 block text-sm font-medium text-blue-600">
                                Статус
                            </label>
                            <select
                                value={filters.status ?? ''}
                                onChange={(event) =>
                                    handleFilterChange(
                                        'status',
                                        event.target.value ? Number(event.target.value) : null,
                                    )
                                }
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            >
                                <option value="">Все статусы</option>
                                {statuses.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-[180px] shrink-0">
                            <label className="mb-1.5 block text-sm text-left font-medium text-blue-600">
                                Тип дохода-расхода
                            </label>
                            <select
                                value={filters.article_id ?? ''}
                                onChange={(event) =>
                                    handleFilterChange(
                                        'article_id',
                                        event.target.value ? Number(event.target.value) : null,
                                    )
                                }
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            >
                                <option value="">Все типы</option>
                                {filteredArticles.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-[160px] shrink-0">
                            <label className="mb-1.5 block text-sm font-medium text-left text-blue-600">
                                Дата с
                            </label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(event) =>
                                    handleFilterChange('dateFrom', event.target.value)
                                }
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />
                        </div>

                        <div className="w-[160px] shrink-0">
                            <label className="mb-1.5 block text-sm font-medium text-left text-blue-600">
                                Дата по
                            </label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(event) =>
                                    handleFilterChange('dateTo', event.target.value)
                                }
                                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />
                        </div>

                        <div className="shrink-0">
                            <label className="block mb-1.5 text-sm font-medium text-transparent select-none">
                                reset
                            </label>
                            <StyledTooltip title="Сбросить фильтры">
                                <button
                                    onClick={handleResetFilters}
                                    className="p-2 text-gray-600 transition-colors rounded-lg hover:text-gray-900 hover:bg-gray-100"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </StyledTooltip>
                        </div>
                    </div>
                </div>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button variant="outlined" startIcon={<Add />} onClick={handleCreate}>
                        Создать платеж
                    </Button>
                </Box>
                <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
                    <PaymentsTable
                        payments={data}
                        loading={loading}
                        focusedPaymentId={focusId}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                    {pagination && (
                        <TablePagination
                            pagination={pagination}
                            onPageChange={(newPage) => {
                                clearFocusFromUrl();
                                setPage(newPage);
                            }}
                            onSizeChange={(newSize) => {
                                clearFocusFromUrl();
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

            <Modal
                isOpen={modal === 'create'}
                onClose={closeAndResetSelection}
                title="Создать платеж"
            >
                <PaymentForm
                    mode="create"
                    projectId={projectIdNum ?? currentProject?.id ?? null}
                    blockId={blockIdNum}
                    refs={refs}
                    loading={submitting}
                    onSubmit={handleCreatePayment}
                    onCancel={closeAndResetSelection}
                />
            </Modal>

            <Modal
                isOpen={modal === 'edit' && Boolean(selectedPayment)}
                onClose={closeAndResetSelection}
                title="Редактировать платеж"
            >
                {selectedPayment && (
                    <PaymentForm
                        mode="edit"
                        payment={selectedPayment}
                        projectId={selectedPayment.project_id}
                        blockId={selectedPayment.block_id}
                        refs={refs}
                        loading={submitting}
                        onSubmit={handleUpdatePayment}
                        onCancel={closeAndResetSelection}
                    />
                )}
            </Modal>

            <Modal
                isOpen={modal === 'view' && Boolean(current ?? selectedPayment)}
                onClose={closeAndResetSelection}
                title="Карточка платежа"
            >
                {(current ?? selectedPayment) && (
                    <PaymentDetail
                        payment={(current ?? selectedPayment)!}
                        onEdit={() => setModal('edit')}
                        onClose={closeAndResetSelection}
                    />
                )}
            </Modal>

            {/* <ConfirmDialogNew
                isOpen={modal === 'delete' && Boolean(selectedPayment)}
                onClose={closeAndResetSelection}
                onConfirm={handleDeletePayment}
                title="Удалить платеж?"
                message={`Вы уверены, что хотите удалить платеж "${selectedPayment?.title}"?`}
                confirmText="Удалить"
                cancelText="Отмена"
                variant="danger"
                loading={submitting}
            /> */}
        </div>
    );
}
