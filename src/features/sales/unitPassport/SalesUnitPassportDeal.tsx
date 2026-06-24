import { useState } from 'react';
import {
    BadgeCheck,
    Ban,
    CalendarRange,
    ChevronDown,
    Download,
    ListChecks,
    Paperclip,
    Pencil,
    Receipt,
    Wallet,
} from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatData';
import { HeaderIconAction } from './SalesUnitPassportUI';

export const SalesUnitPassportDeal = ({
    deal,
    payments,
    schedules,
    onPaymentClick,
    onScheduleClick,
    onEditClick,
    onSignClick,
    onCancelClick,
    onFileClick,
    onDownloadScheduleClick,
    downloadingScheduleDealId,
    getDealStatusName,
    canSign,
    canCancel,
}: any) => {
    const [activeTab, setActiveTab] = useState<'payments' | 'schedule'>('payments');
    const [expandedScheduleIds, setExpandedScheduleIds] = useState<number[]>([]);

    const toggleScheduleExpand = (scheduleId: number) => {
        setExpandedScheduleIds((prev) =>
            prev.includes(scheduleId)
                ? prev.filter((id) => id !== scheduleId)
                : [...prev, scheduleId],
        );
    };

    const totals = schedules.reduce(
        (acc: any, item: any) => {
            acc.planned += Number(item.planned_amount || 0);
            acc.paid += Number(item.paid_amount || 0);
            acc.remaining += Number(item.remaining_amount || 0);
            return acc;
        },
        { planned: 0, paid: 0, remaining: 0 },
    );

    const isDownloading = Number(downloadingScheduleDealId) === Number(deal.id);

    return (
        <div className="overflow-hidden border rounded-md border-violet-200">
            <div>
                <div className="grid grid-cols-[1fr_120px_140px_100px_80px] border-b border-violet-200 bg-violet-50 font-semibold uppercase tracking-wide text-violet-500">
                    <div className="px-2.5 py-1.5 text-[12px]">Договор</div>
                    <div className="px-2.5 py-1.5 text-[12px]">Дата</div>
                    <div className="px-2.5 py-1.5 text-[12px]">Сумма</div>
                    <div className="px-2.5 py-1.5 text-[12px]">Сделка</div>
                    <div className="px-2.5 py-1.5 text-[12px]">Действия</div>
                </div>

                <div className="grid grid-cols-[1fr_120px_140px_100px_80px] items-center px-3 py-2.5">
                    <div className="min-w-0">
                        <div className="text-xs font-semibold truncate text-slate-800">
                            №{deal.contract_number || deal.id}
                        </div>
                        <div className="truncate text-[12px] text-lime-600">
                            {getDealStatusName(deal)} ·{' '}
                            {deal.manager_user
                                ? [deal.manager_user.last_name, deal.manager_user.first_name]
                                      .filter(Boolean)
                                      .join(' ')
                                : '—'}
                        </div>
                        {canSign || canCancel ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {canSign ? (
                                    <button
                                        type="button"
                                        onClick={() => onSignClick?.(deal)}
                                        className="inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-50 px-2.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                    >
                                        <BadgeCheck size={13} />
                                        Подписать
                                    </button>
                                ) : null}
                                {canCancel ? (
                                    <button
                                        type="button"
                                        onClick={() => onCancelClick?.(deal)}
                                        className="inline-flex h-7 items-center gap-1 rounded-lg bg-red-50 px-2.5 text-[11px] font-semibold text-red-700 transition hover:bg-red-100"
                                    >
                                        <Ban size={13} />
                                        Отменить
                                    </button>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                    <div className="text-xs font-medium text-slate-700">
                        {formatDate(deal.contract_date)}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-green-700">
                            {Number(deal.total_amount || 0).toLocaleString('ru-RU')}
                        </div>
                        <div className="text-[12px] text-slate-500">
                            {deal.currency_info?.code || '—'} · {deal.payment_type_ref?.name || '—'}
                        </div>
                    </div>
                    <div className="text-xs text-slate-600">{deal.deal_type?.name || '—'}</div>

                    <div className="flex justify-end gap-1">
                        <HeaderIconAction
                            title="Файлы договора"
                            icon={<Paperclip size={13} />}
                            className="bg-violet-500 hover:bg-violet-600"
                            onClick={() => onFileClick?.(deal)}
                        />
                        <HeaderIconAction
                            title="Редактировать договор"
                            icon={<Pencil size={13} />}
                            className="bg-blue-500 hover:bg-blue-600"
                            onClick={() => onEditClick?.(deal)}
                        />
                    </div>
                </div>

                {deal.note && (
                    <div className="px-2 py-1.5 text-[12px] italic text-slate-500">{deal.note}</div>
                )}
            </div>

            <div className="inline-flex bg-white rounded-lg shadow-sm ring-1 ring-stone-200">
                <button
                    type="button"
                    onClick={() => setActiveTab('payments')}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        activeTab === 'payments'
                            ? 'bg-green-100 text-green-600'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Receipt size={15} />
                    Платежи
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('schedule')}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        activeTab === 'schedule'
                            ? 'bg-rose-100 text-rose-500'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <CalendarRange size={15} />
                    График
                </button>
            </div>

            <div className="pt-3">
                {activeTab === 'payments' ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-end">
                            <HeaderIconAction
                                title="Добавить платеж"
                                icon={<Wallet size={14} />}
                                className="bg-emerald-500 hover:bg-emerald-600"
                                onClick={() => onPaymentClick?.(deal)}
                            />
                        </div>

                        {payments.length > 0 ? (
                            <div className="overflow-hidden border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between px-2 py-1 border-b border-green-200 bg-green-50">
                                    <div className="grid w-full grid-cols-[1fr_200px_130px] font-semibold uppercase tracking-wide text-green-700">
                                        <div className="text-left text-[12px]">Платёж</div>
                                        <div className="text-left text-[12px]">Статус</div>
                                        <div className="text-left text-[12px]">Сумма</div>
                                    </div>
                                </div>

                                {payments.map((payment: any) => (
                                    <div
                                        key={payment.id}
                                        className="grid grid-cols-[1fr_220px_150px] border-t border-stone-100 px-3 py-2.5 text-sm"
                                    >
                                        <div className="text-sm font-medium text-left truncate text-slate-700">
                                            {payment.title || 'Платёж'}
                                        </div>

                                        <div className="flex justify-left gap-1.5 text-xs text-slate-600">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                    payment.status_ref?.code === 'paid'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : payment.status_ref?.code === 'draft'
                                                          ? 'bg-slate-100 text-slate-600'
                                                          : 'bg-amber-100 text-amber-700'
                                                }`}
                                            >
                                                {payment.status_ref?.name || 'Статус'}
                                            </span>
                                            <span className="text-slate-400">·</span>
                                            <span className="text-[11px]">
                                                {formatDate(
                                                    payment.paid_date || payment.planned_date,
                                                )}
                                            </span>
                                        </div>

                                        <div className="text-sm font-semibold text-left text-green-800">
                                            {Number(payment.amount || 0).toLocaleString('ru-RU')}
                                            <span className="ml-1 text-xs font-normal text-green-600">
                                                {payment.currency_ref?.code ||
                                                    payment.currency_ref?.name ||
                                                    'KGS'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-5 text-sm text-center border border-dashed rounded-xl border-stone-200 bg-slate-50 text-slate-500">
                                Платежей пока нет
                            </div>
                        )}
                    </div>
                ) : schedules.length > 0 ? (
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="px-3 py-2 rounded-lg bg-slate-50">
                                <div className="text-[12px] text-slate-500">План</div>
                                <div className="text-sm font-semibold text-slate-800">
                                    {formatCurrency(totals.planned)}
                                </div>
                            </div>
                            <div className="px-3 py-2 rounded-lg bg-emerald-50">
                                <div className="text-[12px] text-emerald-500">Оплачено</div>
                                <div className="text-sm font-semibold text-emerald-700">
                                    {formatCurrency(totals.paid)}
                                </div>
                            </div>
                            <div className="px-3 py-2 rounded-lg bg-orange-50">
                                <div className="text-[12px] text-rose-500">Остаток</div>
                                <div className="text-sm font-semibold text-rose-600">
                                    {formatCurrency(totals.remaining)}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden border rounded-lg border-rose-200">
                            <div className="flex items-center justify-between px-2 py-1 border-b border-rose-200 bg-rose-50">
                                <div className="grid w-full grid-cols-[40px_120px_1fr_110px_110px_110px] text-left font-semibold uppercase tracking-wide text-rose-400">
                                    <div className="text-[12px]">№</div>
                                    <div className="text-[12px]">Дата</div>
                                    <div className="text-[12px]">Статус</div>
                                    <div className="text-[12px]">План</div>
                                    <div className="text-[12px]">Оплачено</div>
                                    <div className="text-[12px]">Остаток</div>
                                </div>
                                <div className="flex items-center gap-1 ml-2 shrink-0">
                                    <StyledTooltip title="Выгрузка в Excel">
                                        <button
                                            type="button"
                                            onClick={() => onDownloadScheduleClick?.(deal)}
                                            disabled={isDownloading}
                                            className="flex items-center justify-center w-6 h-6 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-60"
                                        >
                                            <Download size={13} />
                                        </button>
                                    </StyledTooltip>
                                    <StyledTooltip title="Пересчитать">
                                        <button
                                            type="button"
                                            onClick={() => onScheduleClick?.(deal)}
                                            className="flex items-center justify-center w-6 h-6 text-white transition rounded-lg bg-rose-500 hover:bg-rose-600"
                                        >
                                            <ListChecks size={13} />
                                        </button>
                                    </StyledTooltip>
                                </div>
                            </div>

                            {schedules.map((schedule: any) => {
                                const isExpanded = expandedScheduleIds.includes(schedule.id);
                                const hasLinks = schedule.links?.length > 0;

                                return (
                                    <div key={schedule.id}>
                                        <div
                                            className={`grid grid-cols-[40px_120px_1fr_110px_110px_110px_40px] items-center border-t border-stone-100 px-3 py-2.5 text-xs ${
                                                hasLinks ? 'cursor-pointer hover:bg-slate-50' : ''
                                            }`}
                                            onClick={() =>
                                                hasLinks && toggleScheduleExpand(schedule.id)
                                            }
                                        >
                                            <div className="text-xs font-medium text-slate-800">
                                                {schedule.payment_no}
                                            </div>
                                            <div className="text-xs text-slate-600">
                                                {formatDate(schedule.planned_date)}
                                            </div>
                                            <div className="text-xs text-slate-600">
                                                {schedule.status_ref?.name || 'Запланировано'}
                                                {schedule.overdue_days > 0
                                                    ? ` • ${schedule.overdue_days} дн. просрочки`
                                                    : ''}
                                            </div>
                                            <div className="text-xs font-medium text-slate-800">
                                                {Number(
                                                    schedule.planned_amount || 0,
                                                ).toLocaleString('ru-RU')}
                                            </div>
                                            <div className="text-xs font-medium text-slate-800">
                                                {Number(schedule.paid_amount || 0).toLocaleString(
                                                    'ru-RU',
                                                )}
                                            </div>
                                            <div className="text-xs font-medium text-slate-800">
                                                {Number(
                                                    schedule.remaining_amount || 0,
                                                ).toLocaleString('ru-RU')}
                                            </div>
                                            <div className="flex justify-center">
                                                {hasLinks && (
                                                    <ChevronDown
                                                        size={14}
                                                        className={`text-slate-400 transition-transform ${
                                                            isExpanded ? 'rotate-180' : ''
                                                        }`}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {isExpanded && hasLinks && (
                                            <div className="border-t border-stone-100 bg-slate-50/50">
                                                <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-rose-500">
                                                    Привязанные платежи
                                                </div>
                                                <div className="divide-y divide-stone-100">
                                                    {schedule.links.map((link: any) => (
                                                        <div
                                                            key={link.id}
                                                            className="grid grid-cols-[1fr_120px_120px] px-3 py-2"
                                                        >
                                                            <div className="text-xs font-medium text-left truncate text-slate-700">
                                                                {link.payment?.title ||
                                                                    `Платеж ${link.payment_id}`}
                                                            </div>
                                                            <div className="text-xs text-left text-slate-600">
                                                                {formatDate(
                                                                    link.payment?.paid_date ||
                                                                        link.created_at,
                                                                )}
                                                            </div>
                                                            <div className="text-xs font-semibold text-right text-emerald-700">
                                                                {Number(
                                                                    link.amount || 0,
                                                                ).toLocaleString('ru-RU')}
                                                                <span className="ml-1 text-[10px] font-normal text-slate-500">
                                                                    {link.payment?.currency_ref
                                                                        ?.code || 'KGS'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-end">
                            <HeaderIconAction
                                title="Сформировать график"
                                icon={<ListChecks size={14} />}
                                className="bg-rose-500 hover:bg-rose-600"
                                onClick={() => onScheduleClick?.(deal)}
                            />
                        </div>
                        <div className="px-4 py-5 text-sm text-center border border-dashed rounded-xl border-stone-200 bg-slate-50 text-slate-500">
                            График ещё не сформирован
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
