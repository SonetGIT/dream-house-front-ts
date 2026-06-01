import { useCallback, useEffect, useMemo, useState } from 'react';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Filter, Pencil, RefreshCw, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import InputSearch from '@/components/ui/InputSearch';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { EnumItem } from '@/features/reference/referenceService';
import { useReference } from '@/features/reference/useReference';
import { createSalesClient } from '@/features/sales/slices/salesClientsSlice';
import {
    fetchSalesLeadSources,
    fetchSalesLeadStatuses,
    type SalesLeadSource,
    type SalesLeadStatus,
} from '@/features/sales/slices/salesDictionariesSlice';
import type { SalesOverviewProject } from '@/features/sales/slices/salesObjOverviewSlice';
import { fetchSalesOverview } from '@/features/sales/slices/salesObjOverviewSlice';
import {
    claimSalesLead,
    createSalesLead,
    fetchSalesLeads,
    type SalesLead,
    type SalesLeadCreatePayload,
    updateSalesLead,
} from '@/features/sales/slices/salesLeadsSlice';
import ConvertDialog, { type ConvertSubmitPayload } from './ConvertDialog';
import LeadCard from './LeadCard';
import LeadDialog from './LeadDialog';

interface LeadColumns {
    [statusId: number]: SalesLead[];
}

interface ColumnTotals {
    [statusId: number]: number;
}

interface ColumnProps {
    status: SalesLeadStatus;
    leads: SalesLead[];
    total: number;
    loading: boolean;
    savingId: number | null;
    statuses: SalesLeadStatus[];
    projects: SalesOverviewProject[];
    sources: SalesLeadSource[];
    managers: EnumItem[];
    blocks: EnumItem[];
    onAddLead: (statusId: number) => void;
    onManageStatuses: () => void;
    onStatusChange: (lead: SalesLead, statusId: number) => void;
    onManagerChange: (lead: SalesLead, managerId: number | null) => void;
    onEdit: (lead: SalesLead) => void;
    onConvert: (lead: SalesLead) => void;
    onClaim: (lead: SalesLead) => void;
}

function StatusColumn({
    status,
    leads,
    total,
    loading,
    savingId,
    statuses,
    projects,
    sources,
    managers,
    blocks,
    onAddLead,
    onManageStatuses,
    onStatusChange,
    onManagerChange,
    onEdit,
    onConvert,
    onClaim,
}: ColumnProps) {
    const color = status.color || '#64748b';

    return (
        <div
            className="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            style={{ borderColor: `${color}50` }}
        >
            <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

            <div className="px-4 py-3 bg-white border-b border-slate-100">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-sm font-semibold truncate">{status.name}</span>
                            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sky-100 px-2 text-xs font-medium text-sky-700">
                                {total}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        <StyledTooltip title="Добавить лида">
                            <button
                                onClick={() => onAddLead(Number(status.id))}
                                className="flex items-center justify-center w-8 h-8 transition rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-700"
                            >
                                <UserPlus className="h-3.5 w-3.5" />
                            </button>
                        </StyledTooltip>

                        <StyledTooltip title="Статусы">
                            <button
                                onClick={onManageStatuses}
                                className="flex items-center justify-center w-8 h-8 transition rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                        </StyledTooltip>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-white min-h-48">
                {loading ? (
                    <div className="px-4 py-6 text-xs text-center bg-white border border-dashed rounded-2xl border-slate-200 text-slate-500">
                        Загружаем лиды...
                    </div>
                ) : leads.length === 0 ? (
                    <button
                        onClick={() => onAddLead(Number(status.id))}
                        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-white px-4 py-8 text-center text-xs text-slate-500 transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-slate-700"
                        style={{ borderColor: `${color}55` }}
                    >
                        <span>Лидов пока нет</span>
                        <span style={{ color }}>+ Добавить</span>
                    </button>
                ) : (
                    leads.map((lead) => (
                        <LeadCard
                            key={lead.id}
                            lead={lead}
                            statuses={statuses}
                            sources={sources}
                            managers={managers}
                            projects={projects}
                            blocks={blocks}
                            disabled={savingId === lead.id}
                            canAssignManager
                            onStatusChange={onStatusChange}
                            onManagerChange={onManagerChange}
                            onEdit={onEdit}
                            onConvert={onConvert}
                            onClaim={onClaim}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

const parseFullName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);

    return {
        last_name: parts[0] ?? '',
        first_name: parts[1] ?? parts[0] ?? 'Клиент',
        middle_name: parts.slice(2).join(' ') || null,
    };
};

export default function LeadsPage() {
    const dispatch = useAppDispatch();
    const { projects } = useAppSelector((state) => state.salesObjOverview);
    const { items, pagination, loading, error } = useAppSelector((state) => state.salesLeads);
    const { leadStatuses, leadSources } = useAppSelector((state) => state.salesDictionaries);
    const blocksRef = useReference('projectBlocks');
    const usersRef = useReference('users');

    const [savingLeadId, setSavingLeadId] = useState<number | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [filterSearch, setFilterSearch] = useState('');
    const [filterProject, setFilterProject] = useState('');
    const [filterBlock, setFilterBlock] = useState('');

    const [leadDialog, setLeadDialog] = useState<{
        open: boolean;
        lead: SalesLead | null;
        defaultStatusId?: number;
    }>({ open: false, lead: null });
    const [leadSaving, setLeadSaving] = useState(false);

    const [convertDialog, setConvertDialog] = useState<{ open: boolean; lead: SalesLead | null }>({
        open: false,
        lead: null,
    });
    const [convertSaving, setConvertSaving] = useState(false);

    const blocks = useMemo(() => blocksRef.data ?? [], [blocksRef.data]);
    const filteredBlocks = useMemo(() => {
        if (!filterProject) {
            return blocks;
        }

        return blocks.filter((block) => Number(block.project_id) === Number(filterProject));
    }, [blocks, filterProject]);
    const managers = useMemo(
        () => (usersRef.data ?? []).filter((user) => String(user.role_id) === '16'),
        [usersRef.data],
    );

    const loadLeads = useCallback(
        () =>
            dispatch(
                fetchSalesLeads({
                    search: filterSearch || undefined,
                    project_id: filterProject ? Number(filterProject) : undefined,
                    block_id: filterBlock ? Number(filterBlock) : undefined,
                    page: 1,
                    size: 100,
                }),
            ),
        [dispatch, filterBlock, filterProject, filterSearch],
    );

    useEffect(() => {
        if (projects.length === 0) {
            dispatch(fetchSalesOverview());
        }
        if (leadStatuses.length === 0) {
            dispatch(fetchSalesLeadStatuses());
        }
        if (leadSources.length === 0) {
            dispatch(fetchSalesLeadSources());
        }
    }, [dispatch, leadSources.length, leadStatuses.length, projects.length]);

    useEffect(() => {
        loadLeads();
    }, [loadLeads]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const columns = useMemo<LeadColumns>(() => {
        const next: LeadColumns = {};

        leadStatuses.forEach((status) => {
            next[Number(status.id)] = [];
        });

        items.forEach((lead) => {
            const statusId = Number(lead.status_id);
            if (!next[statusId]) {
                next[statusId] = [];
            }
            next[statusId].push(lead);
        });

        return next;
    }, [items, leadStatuses]);

    const totals = useMemo<ColumnTotals>(() => {
        const next: ColumnTotals = {};

        leadStatuses.forEach((status) => {
            next[Number(status.id)] = columns[Number(status.id)]?.length ?? 0;
        });

        return next;
    }, [columns, leadStatuses]);

    const grandTotal = pagination?.total ?? items.length;

    const handleSaveLead = async (payload: SalesLeadCreatePayload) => {
        setLeadSaving(true);

        try {
            if (leadDialog.lead) {
                await dispatch(
                    updateSalesLead({
                        id: leadDialog.lead.id,
                        payload,
                    }),
                ).unwrap();
                toast.success('Лид обновлен');
            } else {
                await dispatch(createSalesLead(payload)).unwrap();
                toast.success('Лид создан');
            }

            setLeadDialog({ open: false, lead: null });
            await loadLeads();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Не удалось сохранить лида');
        } finally {
            setLeadSaving(false);
        }
    };

    const handleStatusChange = async (lead: SalesLead, statusId: number) => {
        setSavingLeadId(lead.id);

        try {
            await dispatch(
                updateSalesLead({
                    id: lead.id,
                    payload: { status_id: statusId },
                }),
            ).unwrap();
            toast.success('Статус обновлен');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Ошибка изменения статуса');
        } finally {
            setSavingLeadId(null);
        }
    };

    const handleManagerChange = async (lead: SalesLead, managerId: number | null) => {
        setSavingLeadId(lead.id);

        try {
            await dispatch(
                updateSalesLead({
                    id: lead.id,
                    payload: { manager_user_id: managerId },
                }),
            ).unwrap();
            toast.success(managerId ? 'Ответственный назначен' : 'Ответственный снят');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Ошибка назначения менеджера');
        } finally {
            setSavingLeadId(null);
        }
    };

    const handleClaim = async (lead: SalesLead) => {
        setSavingLeadId(lead.id);

        try {
            await dispatch(claimSalesLead(lead.id)).unwrap();
            toast.success('Лид закреплен за вами');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Ошибка закрепления лида');
        } finally {
            setSavingLeadId(null);
        }
    };

    const handleConvert = async ({ projectId, blockId, unitId }: ConvertSubmitPayload) => {
        if (!convertDialog.lead) return;

        setConvertSaving(true);

        try {
            const names = parseFullName(convertDialog.lead.full_name || '');
            const client = await dispatch(
                createSalesClient({
                    ...names,
                    phone: convertDialog.lead.phone,
                    email: convertDialog.lead.email,
                    project_id: projectId,
                    block_id: blockId,
                    unit_id: unitId,
                    comment: convertDialog.lead.comment,
                }),
            ).unwrap();

            await dispatch(
                updateSalesLead({
                    id: convertDialog.lead.id,
                    payload: {
                        client_id: client.id,
                        project_id: projectId,
                        block_id: blockId,
                        unit_id: unitId,
                    },
                }),
            ).unwrap();

            toast.success('Клиент создан из лида');
            setConvertDialog({ open: false, lead: null });
            await loadLeads();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Ошибка конвертации лида');
        } finally {
            setConvertSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-sm">
                <header className="z-10 border-b shrink-0 border-border bg-card/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3 px-5 h-14">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Filter className="w-4 h-4 text-blue-700" />
                            <span className="text-blue-600">
                                Всего лидов:{' '}
                                <strong className="text-blue-700 text-foreground">
                                    {grandTotal}
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
                                    const value = e.target.value === 'all' ? '' : e.target.value;
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

                            <select
                                value={filterBlock || 'all'}
                                onChange={(e) =>
                                    setFilterBlock(e.target.value === 'all' ? '' : e.target.value)
                                }
                                className="h-[37px] min-w-44 rounded-md border border-blue-200 bg-white px-3 text-sm text-slate-700 transition hover:border-[#8eb9ed] hover:bg-[#f5fbff]"
                                disabled={!filteredBlocks.length}
                            >
                                <option value="all">
                                    {filterProject ? 'Все блоки объекта' : 'Все блоки'}
                                </option>
                                {filteredBlocks.map((block) => (
                                    <option key={String(block.id)} value={String(block.id)}>
                                        {block.name ?? `Блок #${block.id}`}
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
                                    setFilterBlock('');
                                }}
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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

            <div className="px-4 pt-5 pb-4 mt-4">
                {leadStatuses.length === 0 && loading ? (
                    <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
                        Загружаем воронку лидов...
                    </div>
                ) : (
                    <div className="flex h-[calc(100vh-120px)] gap-4 overflow-x-auto pb-4">
                        {leadStatuses.map((status) => (
                            <StatusColumn
                                key={status.id}
                                status={status}
                                leads={columns[Number(status.id)] ?? []}
                                total={totals[Number(status.id)] ?? 0}
                                loading={loading && !(columns[Number(status.id)] ?? []).length}
                                savingId={savingLeadId}
                                statuses={leadStatuses}
                                projects={projects}
                                sources={leadSources}
                                managers={managers}
                                blocks={blocks}
                                onAddLead={(statusId) =>
                                    setLeadDialog({
                                        open: true,
                                        lead: null,
                                        defaultStatusId: statusId,
                                    })
                                }
                                onManageStatuses={() =>
                                    toast('Управление статусами пока не подключено', {
                                        icon: 'ℹ️',
                                    })
                                }
                                onStatusChange={handleStatusChange}
                                onManagerChange={handleManagerChange}
                                onEdit={(lead) => setLeadDialog({ open: true, lead })}
                                onConvert={(lead) => setConvertDialog({ open: true, lead })}
                                onClaim={handleClaim}
                            />
                        ))}
                    </div>
                )}
            </div>

            <LeadDialog
                open={leadDialog.open}
                onClose={() => setLeadDialog({ open: false, lead: null })}
                onSave={handleSaveLead}
                saving={leadSaving}
                lead={leadDialog.lead}
                projects={projects}
                blocks={blocks}
                statuses={leadStatuses}
                sources={leadSources}
                defaultStatusId={leadDialog.defaultStatusId}
            />

            <ConvertDialog
                open={convertDialog.open}
                onClose={() => setConvertDialog({ open: false, lead: null })}
                onConvert={handleConvert}
                converting={convertSaving}
                lead={convertDialog.lead}
                projects={projects}
                blocks={blocks}
            />
        </div>
    );
}
