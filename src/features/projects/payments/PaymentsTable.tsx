import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
    Plus,
    Search,
    Eye,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    X,
    Loader2,
    ArrowUpDown,
    CreditCard,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    fetchPayments,
    fetchPaymentStatuses,
    fetchPaymentTypes,
    type PaymentSearchParams,
} from './paymentSlice';
import { Button, Input } from '@mui/material';

const ALL = '__all__';

const formatAmount = (amount: number, code?: string) => {
    const formatted = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2 }).format(amount);
    return code ? `${formatted} ${code}` : formatted;
};

const formatDate = (d: string | null | undefined) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export function PaymentsTable() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { data, pagination, loading, types, statuses } = useAppSelector((s) => s.payments);

    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [projectId, setProjectId] = useState<string>(ALL);
    const [typeId, setTypeId] = useState<string>(ALL);
    const [statusId, setStatusId] = useState<string>(ALL);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);

    const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        if (types.length === 0) dispatch(fetchPaymentTypes());
        if (statuses.length === 0) dispatch(fetchPaymentStatuses());
    }, [dispatch, types.length, statuses.length]);

    const buildParams = useCallback(
        (p: number): PaymentSearchParams => ({
            page: p,
            size: 15,
            search: debouncedSearch || undefined,
            project_id: projectId !== ALL ? Number(projectId) : undefined,
            payment_type: typeId !== ALL ? Number(typeId) : undefined,
            status: statusId !== ALL ? Number(statusId) : undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
        }),
        [debouncedSearch, projectId, typeId, statusId, dateFrom, dateTo],
    );

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, projectId, typeId, statusId, dateFrom, dateTo]);

    useEffect(() => {
        dispatch(fetchPayments(buildParams(page)));
    }, [dispatch, buildParams, page]);

    const hasFilters =
        debouncedSearch ||
        projectId !== ALL ||
        typeId !== ALL ||
        statusId !== ALL ||
        dateFrom ||
        dateTo;

    const clearFilters = () => {
        setSearchInput('');
        setProjectId(ALL);
        setTypeId(ALL);
        setStatusId(ALL);
        setDateFrom('');
        setDateTo('');
    };

    // const handleDelete = async () => {
    //     if (!deleteTarget) return;
    //     const result = await dispatch(deletePayment(deleteTarget.id));
    //     if (deletePayment.fulfilled.match(result)) {
    //         toast.success('Платёж удалён');
    //         dispatch(fetchPayments(buildParams(page)));
    //     } else {
    //         toast.error('Не удалось удалить платёж');
    //     }
    //     setDeleteTarget(null);
    // };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center rounded-lg h-9 w-9 bg-primary/10">
                                <CreditCard className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-foreground">Платежи</h1>
                                {pagination && (
                                    <p className="text-sm text-muted-foreground">
                                        Всего: {pagination.total}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button onClick={() => navigate('/create')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Создать платёж
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6">
                {/* Filters */}
                <div className="p-4 mb-4 border rounded-lg border-border bg-card">
                    <div className="flex flex-wrap items-end gap-3">
                        {/* Search */}
                        <div className="relative min-w-[220px] flex-1">
                            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Поиск по названию, контрагенту..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Project */}
                        {/* <div className="min-w-[180px]">
                            <Select value={projectId} onValueChange={setProjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Проект" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>Все проекты</SelectItem>
                                    {PROJECTS.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div> */}

                        {/* Type */}
                        {/* <div className="min-w-[150px]">
                            <Select value={typeId} onValueChange={setTypeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Тип" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>Все типы</SelectItem>
                                    {types.map((t) => (
                                        <SelectItem key={t.id} value={t.id.toString()}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div> */}

                        {/* Status */}
                        {/* <div className="min-w-[180px]">
                            <Select value={statusId} onValueChange={setStatusId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Статус" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>Все статусы</SelectItem>
                                    {statuses.map((s) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div> */}

                        {/* Date range */}
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-[145px]"
                                title="Дата от"
                            />
                            <span className="text-muted-foreground">—</span>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-[145px]"
                                title="Дата до"
                            />
                        </div>

                        {/* {hasFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                <X className="w-4 h-4 mr-1" />
                                Сбросить
                            </Button>
                        )} */}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden border rounded-lg border-border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="w-14">#</TableHead>
                                <TableHead>Название</TableHead>
                                <TableHead>Проект / Блок</TableHead>
                                <TableHead>Тип / Статья</TableHead>
                                <TableHead className="text-right">Сумма</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Плановая дата</TableHead>
                                <TableHead className="text-right w-28">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-16 text-center">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Загрузка...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <ArrowUpDown className="w-8 h-8 text-muted-foreground/40" />
                                            <p className="text-muted-foreground">
                                                {hasFilters
                                                    ? 'По заданным фильтрам платежи не найдены'
                                                    : 'Платежи не найдены'}
                                            </p>
                                            {hasFilters && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={clearFilters}
                                                >
                                                    Сбросить фильтры
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((payment) => (
                                    <TableRow
                                        key={payment.id}
                                        className="transition-colors cursor-pointer hover:bg-muted/40"
                                        onClick={() => navigate(`/view/${payment.id}`)}
                                    >
                                        <TableCell className="text-sm text-muted-foreground">
                                            {payment.id}
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[260px]">
                                                <p className="text-sm font-medium truncate">
                                                    {payment.title}
                                                </p>
                                                {payment.counterparty_name && (
                                                    <p className="text-xs truncate text-muted-foreground">
                                                        {payment.counterparty_name}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <p className="truncate max-w-[160px]">
                                                    {payment.project?.name ?? '—'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {payment.block?.name ?? '—'}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <p>{payment.payment_type_ref?.name ?? '—'}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {payment.article?.name ?? '—'}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span
                                                className={`text-sm font-medium ${
                                                    payment.payment_type === 2
                                                        ? 'text-emerald-600'
                                                        : 'text-foreground'
                                                }`}
                                            >
                                                {payment.payment_type === 2 ? '+' : '−'}
                                                {formatAmount(
                                                    payment.amount,
                                                    payment.currency_ref?.code,
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={payment.status_ref} size="sm" />
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(payment.planned_date)}
                                        </TableCell>
                                        <TableCell>
                                            <div
                                                className="flex items-center justify-end gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8"
                                                    title="Просмотр"
                                                    onClick={() => navigate(`/view/${payment.id}`)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8"
                                                    title="Редактировать"
                                                    onClick={() => navigate(`/edit/${payment.id}`)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 text-destructive hover:text-destructive"
                                                    title="Удалить"
                                                    onClick={() =>
                                                        setDeleteTarget({
                                                            id: payment.id,
                                                            title: payment.title,
                                                        })
                                                    }
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                            Страница {pagination.page} из {pagination.pages} · {pagination.total}{' '}
                            записей
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={pagination.page <= 1 || loading}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Назад
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                disabled={pagination.page >= pagination.pages || loading}
                            >
                                Вперёд
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <DeleteConfirmDialog
                open={!!deleteTarget}
                title="Удалить платёж?"
                description={`Платёж «${deleteTarget?.title}» будет удалён. Это действие необратимо.`}
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}
