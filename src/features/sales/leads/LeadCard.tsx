import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDateTime';
import { Phone, MessageCircle, Lock, Pencil, ArrowRightLeft, UserRoundCheck } from 'lucide-react';
import type { EnumItem } from '@/features/reference/referenceService';
import type { SalesOverviewProject } from '../slices/salesObjOverviewSlice';
import type { SalesLead } from '../slices/salesLeadsSlice';
import type { SalesLeadSource, SalesLeadStatus } from '../slices/salesDictionariesSlice';

interface Props {
    lead: SalesLead;
    statuses: SalesLeadStatus[];
    sources: SalesLeadSource[];
    managers: EnumItem[];
    projects: SalesOverviewProject[];
    blocks: EnumItem[];
    disabled?: boolean;
    canAssignManager?: boolean;
    onStatusChange: (lead: SalesLead, statusId: number) => void;
    onManagerChange: (lead: SalesLead, managerId: number | null) => void;
    onEdit: (lead: SalesLead) => void;
    onConvert: (lead: SalesLead) => void;
    onClaim: (lead: SalesLead) => void;
}

function StatusBadge({ color, name }: { color?: string | null; name: string }) {
    const c = color ?? '#3287fd';

    return (
        <span
            className="inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: c + '18', color: c, borderColor: c + '40' }}
        >
            {name}
        </span>
    );
}

function getManagerLabel(manager?: EnumItem) {
    if (!manager) return '';

    const name = typeof manager.name === 'string' ? manager.name.trim() : '';
    const username = typeof manager.username === 'string' ? manager.username.trim() : '';

    return name || username || `ID: ${manager.id}`;
}

export default function LeadCard({
    lead,
    statuses,
    sources,
    managers,
    projects,
    blocks,
    disabled,
    canAssignManager,
    onStatusChange,
    onManagerChange,
    onEdit,
    onConvert,
    onClaim,
}: Props) {
    const source = sources.find((s) => Number(s.id) === Number(lead.source_id));
    const currentStatus = statuses.find((s) => Number(s.id) === Number(lead.status_id));
    const currentManager = managers.find((m) => Number(m.id) === Number(lead.manager_user_id));
    const phoneDigits = String(lead.phone ?? '').replace(/\D/g, '');
    const title = lead.full_name || lead.phone || `Лид #${lead.id}`;
    const project = projects.find((p) => Number(p.id) === Number(lead.project_id));
    const block = blocks.find((b) => Number(b.id) === Number(lead.block_id));

    return (
        <div className="text-sm transition-shadow border shadow-sm rounded-xl border-border bg-card hover:shadow-md">
            <div className="p-3 pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-1.5">
                            {lead.is_locked ? (
                                <Lock className="w-3 h-3 shrink-0 text-muted-foreground" />
                            ) : null}
                            <span className="text-xs font-medium truncate">{title}</span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {formatDateTime(lead.created_at)}
                        </div>
                    </div>

                    {lead.client_id ? (
                        <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                            Клиент
                        </span>
                    ) : (
                        <span className="shrink-0 rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                            Лид
                        </span>
                    )}
                </div>

                <div className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
                    {lead.phone ? (
                        <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                            <span className="text-sm truncate">{lead.phone}</span>
                        </div>
                    ) : null}

                    <div className="truncate">
                        {project?.name ?? 'Без проекта'}
                        {block ? ` · ${block.name}` : ''}
                    </div>

                    {source ? (
                        <div>
                            <StatusBadge color={source.color} name={source.name} />
                        </div>
                    ) : null}

                    {lead.interest_budget_from || lead.interest_budget_to ? (
                        <div className="text-[10px]">
                            Бюджет:
                            {lead.interest_budget_from && lead.interest_budget_to
                                ? ` ${formatCurrency(lead.interest_budget_from)} - ${formatCurrency(lead.interest_budget_to)}`
                                : lead.interest_budget_from
                                  ? ` от ${formatCurrency(lead.interest_budget_from)}`
                                  : ` до ${formatCurrency(lead.interest_budget_to)}`}
                        </div>
                    ) : null}

                    {lead.interest_rooms != null ? (
                        <div className="text-[10px]">{lead.interest_rooms} комн.</div>
                    ) : null}
                </div>

                {lead.comment ? (
                    <div className="mt-2 line-clamp-2 rounded-lg bg-muted/50 px-2 py-1.5 text-[11px] text-muted-foreground">
                        {lead.comment}
                    </div>
                ) : null}
            </div>

            <div className="px-3 py-2 border-t border-border/60">
                {canAssignManager ? (
                    <select
                        value={lead.manager_user_id ? String(lead.manager_user_id) : ''}
                        disabled={disabled}
                        onChange={(e) =>
                            onManagerChange(lead, e.target.value ? Number(e.target.value) : null)
                        }
                        className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-[11px] focus:outline-none disabled:opacity-50"
                    >
                        <option value="">Назначить ответственного</option>
                        {managers.map((manager) => (
                            <option key={String(manager.id)} value={String(manager.id)}>
                                {getManagerLabel(manager)}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="px-0.5 text-[11px] text-muted-foreground">
                        Ответственный:{' '}
                        {lead.manager_user_id
                            ? getManagerLabel(currentManager) || `ID: ${lead.manager_user_id}`
                            : 'не назначен'}
                    </div>
                )}
            </div>

            <div className="p-2 space-y-2 border-t border-border/60">
                <div className="grid grid-cols-4 gap-3">
                    <StyledTooltip title="WhatsApp">
                        <a
                            href={phoneDigits ? `https://wa.me/${phoneDigits}` : undefined}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => !phoneDigits && e.preventDefault()}
                            className="flex items-center justify-center h-8 text-white transition-colors rounded-lg bg-emerald-600/90 hover:bg-emerald-700"
                        >
                            <MessageCircle className="w-4 h-4" />
                        </a>
                    </StyledTooltip>

                    <StyledTooltip title="Перевести в клиенты">
                        <button
                            disabled={disabled || Boolean(lead.client_id)}
                            onClick={() => onConvert(lead)}
                            className="flex items-center justify-center h-8 text-white transition-colors rounded-lg bg-orange-500/90 hover:bg-orange-600 disabled:opacity-40"
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                        </button>
                    </StyledTooltip>

                    <StyledTooltip
                        title={lead.is_locked ? 'Лид уже закреплен' : 'Закрепить за собой'}
                    >
                        <button
                            disabled={disabled || lead.is_locked}
                            onClick={() => onClaim(lead)}
                            className="flex items-center justify-center h-8 text-white transition-colors rounded-lg bg-violet-500/90 hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <UserRoundCheck className="w-4 h-4" />
                        </button>
                    </StyledTooltip>

                    <StyledTooltip title="Редактировать">
                        <button
                            disabled={disabled}
                            onClick={() => onEdit(lead)}
                            className="flex items-center justify-center h-8 text-white transition-colors rounded-lg bg-sky-600/90 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </StyledTooltip>
                </div>

                <div className="flex gap-1.5">
                    <select
                        value={lead.status_id ?? ''}
                        disabled={disabled}
                        onChange={(e) => {
                            const next = Number(e.target.value);
                            if (next && next !== lead.status_id) {
                                onStatusChange(lead, next);
                            }
                        }}
                        className="h-8 flex-1 rounded-lg border px-2.5 text-[11px] font-medium focus:outline-none disabled:opacity-50"
                        style={{
                            borderColor: currentStatus?.color ?? undefined,
                            boxShadow: currentStatus?.color
                                ? `inset 3px 0 0 ${currentStatus.color}`
                                : undefined,
                        }}
                    >
                        <option value="" disabled>
                            Выберите статус
                        </option>
                        {statuses.map((status) => (
                            <option key={status.id} value={status.id}>
                                {status.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
