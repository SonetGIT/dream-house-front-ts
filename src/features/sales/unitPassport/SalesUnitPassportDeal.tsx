import { useState } from 'react';
import {
    ListChecks,
    Receipt,
    CalendarRange,
    Wallet,
    Paperclip,
    Pencil,
    ChevronDown,
} from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatData';
import { HeaderIconAction } from './SalesUnitPassportSidbar';

/**************************************************************************************************************************/
export const SalesUnitPassportDeal = ({
    deal,
    payments,
    schedules,
    onPaymentClick,
    onScheduleClick,
    getDealStatusName,
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
    console.log('schedules', schedules);
    const totals = schedules.reduce(
        (acc: any, item: any) => {
            acc.planned += Number(item.planned_amount || 0);
            acc.paid += Number(item.paid_amount || 0);
            acc.remaining += Number(item.remaining_amount || 0);
            return acc;
        },
        { planned: 0, paid: 0, remaining: 0 },
    );

    /***************************************************************************************************************/
    return (
        <div className="overflow-hidden border rounded-md border-violet-200">
            <div>
                {/* Заголовок таблицы */}
                <div className="grid grid-cols-[1fr_120px_140px_100px_80px] bg-violet-50  uppercase tracking-wide text-violet-500 font-semibold border-b border-violet-200">
                    <div className=" px-2.5 py-1.5 text-[12px]">Договор</div>
                    <div className=" px-2.5 py-1.5 text-[12px]">Дата</div>
                    <div className=" px-2.5 py-1.5 text-[12px]">Сумма</div>
                    <div className=" px-2.5 py-1.5 text-[12px]">Сделка</div>
                    <div className=" px-2.5 py-1.5 text-[12px]">Действия</div>
                </div>

                {/* Строка данных */}
                <div className="grid grid-cols-[1fr_120px_140px_100px_80px] items-center px-3 py-2.5 ">
                    <div className="min-w-0">
                        {/* № договор */}
                        <div className="text-xs font-semibold truncate text-slate-800">
                            №{deal.contract_number || deal.id}
                        </div>
                        {/* Статус договора */}
                        <div className="text-[12px] text-lime-600 truncate">
                            {getDealStatusName(deal)} ·{' '}
                            {deal.manager_user
                                ? [deal.manager_user.last_name, deal.manager_user.first_name]
                                      .filter(Boolean)
                                      .join(' ')
                                : '—'}
                        </div>
                    </div>
                    {/* Дата создание */}
                    <div className="text-xs font-medium text-slate-700">
                        {formatDate(deal.contract_date)}
                    </div>
                    {/* Сумма /Валюта */}
                    <div>
                        <div className="text-sm font-bold text-green-700">
                            {Number(deal.total_amount || 0).toLocaleString('ru-RU')}
                        </div>
                        <div className="text-[12px] text-slate-500">
                            {deal.currency_info?.code || '—'} · {deal.payment_type_ref?.name || '—'}
                        </div>
                    </div>
                    {/* Тип сделки */}
                    <div className="text-xs text-slate-600">{deal.deal_type?.name || '—'}</div>

                    <div className="flex justify-end gap-1">
                        <HeaderIconAction
                            title="Файл"
                            icon={<Paperclip size={13} />}
                            className="bg-violet-500 hover:bg-violet-600"
                            // onClick={() => onFileClick?.(deal)}
                        />
                        <HeaderIconAction
                            title="Редактировать"
                            icon={<Pencil size={13} />}
                            className="bg-blue-500 hover:bg-blue-600"
                            // onClick={() => onEditClick?.(deal)}
                        />
                    </div>
                </div>

                {/* Примечание */}
                {deal.note && (
                    <div className="px-2 py-1.5 text-[12px] text-slate-500 italic">{deal.note}</div>
                )}
            </div>

            {/* ПЛАТЕЖИ /ГРАФИК */}
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
                    payments.length > 0 ? (
                        <div className="overflow-hidden border border-green-200 rounded-lg">
                            {/* Шапка таблицы + кнопка справа */}
                            <div className="flex items-center justify-between px-2 py-1 border-b border-green-200 bg-green-50">
                                <div className="grid grid-cols-[1fr_200px_130px] w-full font-semibold uppercase tracking-wide text-green-700">
                                    <div className="text-[12px] text-left">Платёж</div>
                                    <div className="text-[12px] text-left">Статус</div>
                                    <div className="text-[12px] text-left">Сумма</div>
                                </div>
                                <div className="ml-2 shrink-0">
                                    <HeaderIconAction
                                        title="Добавить платёж"
                                        icon={<Wallet size={14} />}
                                        className="bg-emerald-500 hover:bg-emerald-600"
                                        onClick={() => onPaymentClick(deal)}
                                    />
                                </div>
                            </div>

                            {/* ПЛАТЕЖИ */}
                            {payments.map((p: any) => (
                                <div
                                    key={p.id}
                                    className="grid grid-cols-[1fr_220px_150px] px-3 py-2.5 border-t border-stone-100 text-sm"
                                >
                                    {/* Название платежа */}
                                    <div className="text-sm font-medium text-left truncate text-slate-700">
                                        {p.title || 'Платёж'}
                                    </div>

                                    {/* Статус + дата */}
                                    <div className="flex justify-left gap-1.5 text-xs text-slate-600">
                                        <span
                                            className={`inline-flex items-left px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                                p.status_ref?.code === 'paid'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : p.status_ref?.code === 'draft'
                                                      ? 'bg-slate-100 text-slate-600'
                                                      : 'bg-amber-100 text-amber-700'
                                            }`}
                                        >
                                            {p.status_ref?.name || 'Статус'}
                                        </span>
                                        <span className="text-slate-400">·</span>
                                        <span className="text-[11px]">
                                            {formatDate(p.paid_date || p.planned_date)}
                                        </span>
                                    </div>

                                    {/* Сумма */}
                                    <div className="text-sm font-semibold text-left text-green-800">
                                        {Number(p.amount || 0).toLocaleString('ru-RU')}
                                        <span className="ml-1 text-xs font-normal text-green-600">
                                            {p.currency_ref?.code || p.currency_ref?.name || 'KGS'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-5 text-sm text-center border border-dashed rounded-xl border-stone-200 bg-slate-50 text-slate-500">
                            Платежей пока нет
                        </div>
                    )
                ) : schedules.length > 0 ? (
                    <div className="space-y-3">
                        {/* Сводка по ГРАФИК */}
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

                        {/* Таблица графика + кнопка справа */}
                        <div className="overflow-hidden border rounded-lg border-rose-200">
                            <div className="flex items-center justify-between px-2 py-1 border-b bg-rose-50 border-rose-200">
                                <div className="grid grid-cols-[40px_120px_1fr_110px_110px_110px] w-full text-left font-semibold uppercase tracking-wide text-rose-400">
                                    <div className="text-[12px]">№</div>
                                    <div className="text-[12px]">Дата</div>
                                    <div className="text-[12px]">Статус</div>
                                    <div className="text-[12px]">План</div>
                                    <div className="text-[12px]">Оплачено</div>
                                    <div className="text-[12px]">Остаток</div>
                                </div>
                                <div className="ml-2 shrink-0">
                                    <StyledTooltip
                                        title={
                                            schedules.length > 0
                                                ? 'Пересчитать график'
                                                : 'Сформировать график'
                                        }
                                    >
                                        <button
                                            type="button"
                                            onClick={() => onScheduleClick(deal)}
                                            className="flex items-center justify-center w-6 h-6 text-white transition rounded-lg bg-rose-500 hover:bg-rose-600"
                                        >
                                            <ListChecks size={13} />
                                        </button>
                                    </StyledTooltip>
                                </div>
                            </div>

                            {schedules.map((s: any) => {
                                const isExpanded = expandedScheduleIds.includes(s.id);
                                const hasLinks = s.links?.length > 0;

                                return (
                                    <div key={s.id}>
                                        {/* Основная строка графика */}
                                        <div
                                            className={`grid grid-cols-[40px_120px_1fr_110px_110px_110px_40px] items-center border-t border-stone-100 px-3 py-2.5 text-xs ${
                                                hasLinks ? 'cursor-pointer hover:bg-slate-50' : ''
                                            }`}
                                            onClick={() => hasLinks && toggleScheduleExpand(s.id)}
                                        >
                                            <div className="text-xs font-medium text-slate-800">
                                                {s.payment_no}
                                            </div>
                                            <div className="text-xs text-slate-600">
                                                {formatDate(s.planned_date)}
                                            </div>
                                            <div className="text-xs text-slate-600">
                                                {s.status_ref?.name || 'Запланировано'}
                                                {s.overdue_days > 0
                                                    ? ` • ${s.overdue_days} дн. просрочки`
                                                    : ''}
                                            </div>
                                            <div className="text-xs font-medium text-slate-800">
                                                {Number(s.planned_amount || 0).toLocaleString(
                                                    'ru-RU',
                                                )}
                                            </div>
                                            <div className="text-xs font-medium text-slate-800">
                                                {Number(s.paid_amount || 0).toLocaleString('ru-RU')}
                                            </div>
                                            <div className="text-xs font-medium text-slate-800">
                                                {Number(s.remaining_amount || 0).toLocaleString(
                                                    'ru-RU',
                                                )}
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

                                        {/* Раскрывающаяся секция с платежами */}
                                        {isExpanded && hasLinks && (
                                            <div className="border-t bg-slate-50/50 border-stone-100">
                                                <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-rose-500 font-semibold">
                                                    Привязанные платежи
                                                </div>
                                                <div className="divide-y divide-stone-100">
                                                    {s.links.map((l: any) => (
                                                        <div
                                                            key={l.id}
                                                            className="grid grid-cols-[1fr_120px_120px] px-3 py-2"
                                                        >
                                                            <div className="text-xs font-medium text-left truncate text-slate-700">
                                                                {l.payment?.title ||
                                                                    `Платеж ${l.payment_id}`}
                                                            </div>
                                                            <div className="text-xs text-left text-slate-600">
                                                                {formatDate(
                                                                    l.payment?.paid_date ||
                                                                        l.created_at,
                                                                )}
                                                            </div>
                                                            <div className="text-xs font-semibold text-right text-emerald-700">
                                                                {Number(
                                                                    l.amount || 0,
                                                                ).toLocaleString('ru-RU')}
                                                                <span className="ml-1 text-[10px] font-normal text-slate-500">
                                                                    {l.payment?.currency_ref
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
                    <div className="px-4 py-5 text-sm text-center border border-dashed rounded-xl border-stone-200 bg-slate-50 text-slate-500">
                        График ещё не сформирован
                    </div>
                )}
            </div>
        </div>
    );
};
