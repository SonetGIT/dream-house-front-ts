import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Phone, Plus, RefreshCw, Search, UserCheck, X, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    fetchSalesClients,
    createSalesClient,
    updateSalesClient,
    type SalesClient,
    type SalesClientCreatePayload,
    type SalesClientUpdatePayload,
} from './salesClientsSlice';
import ClientDetail from './ClientDetail';
import ClientForm from './ClientForm';
import {
    formatDateTime,
    formatArea,
    formatMoney,
    getPhoneDigits,
    getLotTypeLabel,
} from '@/utils/formatters';

const PAGE_SIZE = 12;

const PROJECTS = [
    { id: 1, name: 'ЖК «Северный парк»' },
    { id: 2, name: 'ЖК «Южный берег»' },
    { id: 3, name: 'ЖК «Центральный»' },
];

const BLOCKS = [
    { id: 1, name: 'Блок А', project_id: 1 },
    { id: 2, name: 'Блок Б', project_id: 1 },
    { id: 3, name: 'Блок А', project_id: 2 },
    { id: 4, name: 'Блок В', project_id: 2 },
    { id: 5, name: 'Секция 1', project_id: 3 },
    { id: 6, name: 'Секция 2', project_id: 3 },
];

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
        () => BLOCKS.filter((b) => !filterProject || b.project_id === Number(filterProject)),
        [filterProject],
    );

    const load = useCallback(
        (p: number, search: string, projectId: string, blockId: string) => {
            dispatch(
                fetchSalesClients({
                    search: search || undefined,
                    project_id: projectId ? Number(projectId) : undefined,
                    block_id: blockId ? Number(blockId) : undefined,
                    page: p,
                    size: PAGE_SIZE,
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
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            {/* Header */}
            <div className="shrink-0 border-b border-border bg-card px-6 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <UserCheck className="h-5 w-5 text-emerald-500" />
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
                                className="h-8 w-64 rounded-lg border border-border bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>

                        <select
                            value={filterProject}
                            onChange={(e) => handleProjectChange(e.target.value)}
                            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs focus:outline-none"
                        >
                            <option value="">Все объекты</option>
                            {PROJECTS.map((p) => (
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
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        <button
                            onClick={() => setModal({ type: 'create' })}
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-sky-600 px-3 text-xs font-medium text-white hover:bg-sky-700 transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Создать
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                            <th className="px-4 py-2.5 font-medium">#</th>
                            <th className="px-4 py-2.5 font-medium">Клиент</th>
                            <th className="px-4 py-2.5 font-medium">Контакты</th>
                            <th className="px-4 py-2.5 font-medium">Документы</th>
                            <th className="px-4 py-2.5 font-medium">Лот</th>
                            <th className="px-4 py-2.5 font-medium">Объект / Блок</th>
                            <th className="px-4 py-2.5 font-medium">Добавлен</th>
                            <th className="px-4 py-2.5 font-medium">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && clients.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-4 py-16 text-center text-sm text-muted-foreground"
                                >
                                    Загрузка...
                                </td>
                            </tr>
                        ) : clients.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-4 py-16 text-center text-sm text-muted-foreground"
                                >
                                    Клиенты не найдены
                                </td>
                            </tr>
                        ) : (
                            clients.map((client, idx) => {
                                const unit = client.sales_unit;
                                const phoneDigits = getPhoneDigits(client.phone);
                                const rowNum = (pag.page - 1) * PAGE_SIZE + idx + 1;

                                return (
                                    <tr
                                        key={client.id}
                                        onClick={() => setModal({ type: 'detail', client })}
                                        className={`border-b border-border/60 cursor-pointer transition-colors hover:bg-muted/40 ${selectedId === client.id ? 'bg-muted/60' : ''}`}
                                    >
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {rowNum}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {client.is_locked && (
                                                    <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                                                )}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-medium truncate max-w-[140px]">
                                                            {client.full_name}
                                                        </span>
                                                        <ClientBadge />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="space-y-0.5 text-xs text-muted-foreground">
                                                {client.phone && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3 text-blue-500 shrink-0" />
                                                        <span>{client.phone}</span>
                                                    </div>
                                                )}
                                                {client.email && (
                                                    <div className="truncate max-w-[160px]">
                                                        {client.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="space-y-0.5 text-xs text-muted-foreground">
                                                {client.passport_number && (
                                                    <div>Паспорт: {client.passport_number}</div>
                                                )}
                                                {client.pin && <div>ПИН: {client.pin}</div>}
                                                {!client.passport_number && !client.pin && (
                                                    <span>—</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            {unit ? (
                                                <div className="space-y-1">
                                                    <span className="text-xs font-medium">
                                                        {getLotTypeLabel(unit.lot_type)} №
                                                        {unit.unit_number}
                                                    </span>
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {unit.status && (
                                                            <UnitStatusBadge status={unit.status} />
                                                        )}
                                                        <span className="text-[11px] text-muted-foreground">
                                                            {formatArea(unit.area_total)}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            {formatMoney(
                                                                unit.price_total,
                                                                unit.currency_info?.code,
                                                            )}
                                                        </span>
                                                    </div>
                                                    {unit.rooms != null && (
                                                        <div className="text-[11px] text-muted-foreground">
                                                            {unit.rooms === 0
                                                                ? 'Студия'
                                                                : `${unit.rooms} комн.`}
                                                            {client.sales_floor &&
                                                                ` · ${client.sales_floor.floor_number} эт.`}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="text-xs text-muted-foreground space-y-0.5">
                                                {client.sales_project && (
                                                    <div className="font-medium text-foreground">
                                                        {client.sales_project.name}
                                                    </div>
                                                )}
                                                {client.sales_block && (
                                                    <div>{client.sales_block.name}</div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDateTime(client.created_at)}
                                        </td>

                                        <td
                                            className="px-4 py-3"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <a
                                                    href={
                                                        phoneDigits
                                                            ? `tel:+${phoneDigits}`
                                                            : undefined
                                                    }
                                                    onClick={(e) =>
                                                        !phoneDigits && e.preventDefault()
                                                    }
                                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors"
                                                    title="Позвонить"
                                                >
                                                    <Phone className="h-3.5 w-3.5" />
                                                </a>
                                                <a
                                                    href={
                                                        phoneDigits
                                                            ? `https://wa.me/${phoneDigits}`
                                                            : undefined
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    onClick={(e) =>
                                                        !phoneDigits && e.preventDefault()
                                                    }
                                                    className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600/90 text-white hover:bg-emerald-500 transition-colors"
                                                    title="WhatsApp"
                                                >
                                                    <MessageCircle className="h-3.5 w-3.5" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="shrink-0 flex items-center justify-between border-t border-border bg-card px-6 py-3">
                <span className="text-xs text-muted-foreground">
                    Показано {clients.length} из {pag.total}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        disabled={!pag.hasPrev || loading}
                        onClick={() => setPage((p) => p - 1)}
                        className="h-8 rounded-lg border border-border px-3 text-xs text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
                    >
                        Назад
                    </button>
                    <span className="text-xs text-muted-foreground">
                        {pag.page} / {pag.pages}
                    </span>
                    <button
                        disabled={!pag.hasNext || loading}
                        onClick={() => setPage((p) => p + 1)}
                        className="h-8 rounded-lg border border-border px-3 text-xs text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
                    >
                        Далее
                    </button>
                </div>
            </div>

            {/* Detail modal */}
            {modal?.type === 'detail' && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30"
                        onClick={() => setModal(null)}
                    />
                    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
                            <span className="text-sm font-semibold text-gray-900">
                                Карточка клиента
                            </span>
                            <button
                                onClick={() => setModal(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors"
                            >
                                <X className="h-4 w-4" />
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
                    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-10">
                        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                                <h2 className="text-sm font-semibold text-gray-900">
                                    {modal.type === 'create'
                                        ? 'Новый клиент'
                                        : 'Редактировать клиента'}
                                </h2>
                                <button
                                    onClick={() => !submitting && setModal(null)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors"
                                >
                                    <X className="h-4 w-4" />
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
