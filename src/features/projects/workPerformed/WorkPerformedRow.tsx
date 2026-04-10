import { useState } from 'react';
import {
    Pencil,
    Trash2,
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Clock,
    Minus,
} from 'lucide-react';

import {
    STATUS_MAP,
    PROJECT_MAP,
    BLOCK_MAP,
    UNIT_MAP,
    CURRENCY_MAP,
    SERVICE_TYPE_MAP,
} from '../workPerformed/constants';
import type { WorkPerformed } from './workPerformedSlice';

interface Props {
    item: WorkPerformed;
    index: number;
    onEdit: (item: WorkPerformed) => void;
    onDelete: (item: WorkPerformed) => void;
}

function fmtDate(s: string) {
    return new Date(s).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
    });
}

function fmtMoney(price: number, qty: number, currency: number) {
    const sym = CURRENCY_MAP[currency] ?? '₸';
    const total = price * qty;
    return `${total.toLocaleString('ru-RU')} ${sym}`;
}

function SignBadge({ signed }: { signed: boolean | null }) {
    if (signed === true) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    if (signed === false) return <Clock className="w-3.5 h-3.5 text-amber-400" />;
    return <Minus className="w-3.5 h-3.5 text-gray-300" />;
}

export function WorkPerformedRow({ item, index, onEdit, onDelete }: Props) {
    const [expanded, setExpanded] = useState(false);

    const status = STATUS_MAP[item.status] ?? STATUS_MAP[1];
    const totalSum = 1234; // item.items.reduce((acc, it) => acc + it.price * it.quantity, 0);

    return (
        <>
            {/* ── Main row ── */}
            <tr
                className={`border-b border-gray-100 transition-colors cursor-pointer group ${
                    expanded
                        ? 'bg-blue-50/30'
                        : index % 2 === 0
                          ? 'bg-white hover:bg-gray-50'
                          : 'bg-gray-50/40 hover:bg-gray-100/60'
                }`}
                onClick={() => setExpanded((p) => !p)}
            >
                {/* expand indicator */}
                <td className="pl-4 pr-2 py-2.5">
                    <div className="text-gray-400">
                        {expanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                        )}
                    </div>
                </td>

                {/* # */}
                <td className="px-3 py-2.5">
                    <span className="text-[11px] text-gray-400">{index + 1}</span>
                </td>

                {/* code */}
                <td className="px-3 py-2.5">
                    <span className="text-xs font-semibold text-gray-800">
                        {item.code ?? <span className="font-normal text-gray-400">—</span>}
                    </span>
                    <div className="text-[10px] text-gray-400">ID #{item.id}</div>
                </td>

                {/* project + block */}
                <td className="px-3 py-2.5">
                    <div className="text-xs font-medium text-gray-700">
                        {PROJECT_MAP[item.project_id] ?? `Проект #${item.project_id}`}
                    </div>
                    <div className="text-[10px] text-gray-400">
                        {BLOCK_MAP[item.block_id] ?? `Блок #${item.block_id}`}
                    </div>
                </td>

                {/* person */}
                <td className="px-3 py-2.5">
                    <span className="text-xs text-gray-700">
                        {item.performed_person_name || '—'}
                    </span>
                </td>

                {/* status */}
                <td className="px-3 py-2.5">
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold whitespace-nowrap ${status.color} ${status.bg} ${status.border}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                    </span>
                </td>

                {/* signatures */}
                <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5" title="Прораб / ПТО / ГИ">
                        <SignBadge signed={item.signed_by_foreman} />
                        <SignBadge signed={item.signed_by_planning_engineer} />
                        <SignBadge signed={item.signed_by_main_engineer} />
                    </div>
                </td>

                {/* items count + sum */}
                <td className="px-3 py-2.5 text-right">
                    <div className="text-xs font-medium text-gray-700">
                        {item?.items.length} поз.
                    </div>
                    {item?.items.length > 0 && (
                        <div className="text-[10px] text-gray-400">
                            {totalSum.toLocaleString('ru-RU')} ₸
                        </div>
                    )}
                </td>

                {/* date */}
                <td className="px-3 py-2.5">
                    <div className="text-[11px] text-gray-500">{fmtDate(item.created_at)}</div>
                    <div className="text-[10px] text-gray-400">обн: {fmtDate(item.updated_at)}</div>
                </td>

                {/* actions */}
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-0.5 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onEdit(item)}
                            title="Редактировать"
                            className="flex items-center justify-center text-blue-600 transition rounded w-7 h-7 hover:bg-blue-100"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => onDelete(item)}
                            title="Удалить"
                            className="flex items-center justify-center text-red-500 transition rounded w-7 h-7 hover:bg-red-100"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </td>
            </tr>

            {/* ── Expanded items sub-table ── */}
            {expanded && (
                <tr className="border-b border-gray-100">
                    <td colSpan={10} className="px-6 pt-0 pb-3 bg-blue-50/20">
                        {item.items.length === 0 ? (
                            <div className="flex items-center gap-2 py-3 text-xs text-gray-400">
                                <XCircle className="w-3.5 h-3.5 text-gray-300" />
                                Позиции отсутствуют
                            </div>
                        ) : (
                            <div className="overflow-x-auto bg-white border border-blue-100 rounded-lg">
                                <table className="w-full min-w-[700px]">
                                    <thead>
                                        <tr className="border-b border-blue-50 bg-blue-600/5">
                                            <th className="px-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                                #
                                            </th>
                                            <th className="px-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                                Наименование
                                            </th>
                                            <th className="px-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                                Тип
                                            </th>
                                            <th className="px-3 py-1.5 text-right text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                                Кол-во
                                            </th>
                                            <th className="px-3 py-1.5 text-right text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                                Ед.
                                            </th>
                                            <th className="px-3 py-1.5 text-right text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                                Цена
                                            </th>
                                            <th className="px-3 py-1.5 text-right text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                                Сумма
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {item.items.map((it, i) => (
                                            <tr
                                                key={it.id}
                                                className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}
                                            >
                                                <td className="px-3 py-1.5 text-[11px] text-gray-400">
                                                    {i + 1}
                                                </td>
                                                <td className="px-3 py-1.5 text-[11px] text-gray-800 font-medium max-w-[220px]">
                                                    <div className="truncate">{it.name || '—'}</div>
                                                </td>
                                                <td className="px-3 py-1.5">
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                                        {SERVICE_TYPE_MAP[it.service_type] ?? '—'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-1.5 text-[11px] text-gray-700 text-right">
                                                    {it.quantity.toLocaleString('ru-RU')}
                                                </td>
                                                <td className="px-3 py-1.5 text-[11px] text-gray-500 text-right">
                                                    {UNIT_MAP[it.unit_of_measure] ?? '—'}
                                                </td>
                                                <td className="px-3 py-1.5 text-[11px] text-gray-700 text-right">
                                                    {it.price.toLocaleString('ru-RU')}{' '}
                                                    {CURRENCY_MAP[it.currency]}
                                                </td>
                                                <td className="px-3 py-1.5 text-[11px] font-semibold text-gray-800 text-right">
                                                    {fmtMoney(it.price, it.quantity, it.currency)}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="border-t border-blue-100 bg-blue-600/5">
                                            <td
                                                colSpan={6}
                                                className="px-3 py-1.5 text-[10px] font-semibold text-blue-700 text-right"
                                            >
                                                ИТОГО:
                                            </td>
                                            <td className="px-3 py-1.5 text-[11px] font-bold text-blue-700 text-right">
                                                {totalSum.toLocaleString('ru-RU')} ₸
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}
