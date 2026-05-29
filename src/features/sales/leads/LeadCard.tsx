import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDateTime';
import { Phone, MessageCircle, UserPlus, UserCheck, Lock, Pencil } from 'lucide-react';

interface Props {
    lead: Lead;
    statuses: LeadStatus[];
    sources: LeadSource[];
    managers: Manager[];
    projects: Project[];
    blocks: Block[];
    disabled?: boolean;
    canAssignManager?: boolean;
    onStatusChange: (lead: Lead, statusId: number) => void;
    onManagerChange: (lead: Lead, managerId: number | null) => void;
    onEdit: (lead: Lead) => void;
    onConvert: (lead: Lead) => void;
    onClaim: (lead: Lead) => void;
}

function StatusBadge({ color, name }: { color?: string; name: string }) {
    const c = color ?? '#3287fd';
    return (
        <span
            className="inline-flex items-center rounded-full border text-[10px] font-medium px-2 py-0.5 whitespace-nowrap"
            style={{ backgroundColor: c + '18', color: c, borderColor: c + '40' }}
        >
            {name}
        </span>
    );
}

/******************************************************************************************************************/
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
    const source = sources.find((s) => s.id === lead.source_id);
    const currentStatus = statuses.find((s) => s.id === lead.status_id);
    const phoneDigits = String(lead.phone ?? '').replace(/\D/g, '');
    const title = lead.full_name || lead.phone || `Лид #${lead.id}`;
    const project = projects.find((p) => p.id === lead.project_id);
    const block = blocks.find((b) => b.id === lead.block_id);

    return (
        <div className="text-sm transition-shadow border shadow-sm rounded-xl border-border bg-card hover:shadow-md">
            {/* Header */}
            <div className="p-3 pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                            {lead.is_locked && (
                                <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                            )}
                            <span className="text-xs font-medium truncate">{title}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            {formatDateTime(lead.created_at)}
                        </div>
                    </div>
                    {lead.client_id ? (
                        <span className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[10px] font-semibold">
                            Клиент
                        </span>
                    ) : (
                        <span className="shrink-0 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-600 px-2 py-0.5 text-[10px] font-semibold">
                            Лид
                        </span>
                    )}
                </div>

                {/* Meta */}
                <div className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
                    {lead.phone && (
                        <div className="flex items-center gap-1.5 ">
                            <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="text-sm truncate">{lead.phone}</span>
                        </div>
                    )}
                    <div className="truncate ">
                        {project?.name ?? 'Нужно проверить'}
                        {block ? ` · ${block.name}` : ''}
                    </div>
                    {source && (
                        <div>
                            <StatusBadge color={source.color} name={source.name} />
                        </div>
                    )}
                    {(lead.interest_budget_from || lead.interest_budget_to) && (
                        <div className="text-[10px]">
                            Бюджет: {formatCurrency(lead.interest_budget_from)} —{' '}
                            {formatCurrency(lead.interest_budget_to)}
                        </div>
                    )}
                    {lead.interest_rooms != null && (
                        <div className="text-[10px]">{lead.interest_rooms} комн.</div>
                    )}
                </div>

                {lead.comment && (
                    <div className="mt-2 line-clamp-2 rounded-lg bg-muted/50 px-2 py-1.5 text-[11px] text-muted-foreground">
                        {lead.comment}
                    </div>
                )}
            </div>

            {/* Manager assignment */}
            <div className="px-3 py-2 border-t border-border/60">
                {canAssignManager ? (
                    <select
                        value={lead.manager_user_id ?? ''}
                        disabled={disabled}
                        onChange={(e) =>
                            onManagerChange(lead, e.target.value ? Number(e.target.value) : null)
                        }
                        className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-[11px] focus:outline-none disabled:opacity-50"
                    >
                        <option value="">Назначить ответственного</option>
                        {managers.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="text-[11px] text-muted-foreground px-0.5">
                        Ответственный:{' '}
                        {lead.manager_user_id
                            ? (managers.find((m) => m.id === lead.manager_user_id)?.label ??
                              `ID: ${lead.manager_user_id}`)
                            : 'не назначен'}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-2 space-y-2 border-t border-border/60">
                <div className="grid grid-cols-3 gap-3">
                    <StyledTooltip title="WhatsApp">
                        <a
                            href={phoneDigits ? `https://wa.me/${phoneDigits}` : undefined}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => !phoneDigits && e.preventDefault()}
                            className="flex items-center justify-center h-8 text-white transition-colors rounded-lg bg-emerald-600/90 hover:bg-emerald-500"
                        >
                            <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                    </StyledTooltip>
                    <StyledTooltip title="WhatsApp">
                        <button
                            disabled={disabled}
                            onClick={() => onEdit(lead)}
                            className="flex items-center justify-center h-8 text-blue-500 transition-colors border border-blue-600 rounded-lg border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
                            // className="flex items-center justify-center h-8 transition-colors text-blue"
                            title="Редактировать"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                    </StyledTooltip>
                    <StyledTooltip title="Создать клиента">
                        <button
                            disabled={disabled || Boolean(lead.client_id)}
                            onClick={() => onConvert(lead)}
                            className="flex items-center justify-center h-8 text-white transition-colors rounded-lg bg-green-600/90 hover:bg-green-500 disabled:opacity-40"
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                        </button>
                    </StyledTooltip>
                </div>

                {/* Status selector + claim */}
                <div className="flex gap-1.5">
                    <select
                        value={lead.status_id ?? ''}
                        disabled={disabled}
                        onChange={(e) => {
                            const next = Number(e.target.value);
                            if (next && next !== lead.status_id) onStatusChange(lead, next);
                        }}
                        className="flex-1 h-8 rounded-lg border px-2.5 text-[11px] font-medium focus:outline-none disabled:opacity-50"
                        style={{
                            borderColor: currentStatus?.color ?? undefined,
                            boxShadow: currentStatus?.color
                                ? `inset 3px 0 0 ${currentStatus.color}`
                                : undefined,
                        }}
                    >
                        {statuses.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    {!lead.is_locked && (
                        <button
                            disabled={disabled}
                            onClick={() => onClaim(lead)}
                            className="flex items-center justify-center w-8 h-8 transition-colors border rounded-lg border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
                            title="Закрепить за собой"
                        >
                            <UserCheck className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
