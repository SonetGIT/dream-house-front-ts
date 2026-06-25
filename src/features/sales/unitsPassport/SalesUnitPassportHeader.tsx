import {
    Building,
    CalendarClock,
    CircleDollarSign,
    FileText,
    Home,
    Layers3,
    Pencil,
    Ruler,
    Wallet,
    X,
} from 'lucide-react';
import { InlineMetric } from '../unitsPassport/SalesUnitPassportPage';
import { formatCurrency } from '@/utils/formatCurrency';
import type { SalesUnitPassport } from '../slices/salesUnitPassportSlice';

import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { StyledTooltip } from '@/components/ui/StyledTooltip';

type SalesUnitPassportHeaderProps = {
    unit: SalesUnitPassport;
    refs: Record<string, ReferenceResult>;
    onClose?: () => void;
};
export default function SalesUnitPassportHeader({
    unit,
    refs,
    onClose,
}: SalesUnitPassportHeaderProps) {
    return (
        <div className="bg-white ">
            <div className="px-2 pt-1 mb-2">
                <div className="flex items-start justify-between gap-4">
                    {/* ИНФОРМАЦИЯ О ЛОТЕ */}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1.5 text-sm text-slate-700">
                                <Building size={14} className="text-slate-500" />
                                <span className="font-medium">
                                    {refs.prjName.lookup(unit.project_id)}
                                </span>
                            </div>
                            <div className="w-px h-4 bg-stone-300" />
                            <span className="text-sm text-slate-600">
                                {refs.blokName.lookup(unit.block_id)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Home size={15} className="text-blue-500" />
                            <h2 className="font-semibold text-slate-800">
                                Квартира {unit.unit_number}
                            </h2>
                            <span
                                className="rounded-full border px-2.5 py-1 text-xs font-semibold"
                                style={{
                                    backgroundColor: `${unit.status?.color}20`,
                                    borderColor: unit.status?.color,
                                    color: unit.status?.color,
                                }}
                            >
                                {unit.status?.name || 'Статус'}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-5 mt-2 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                                <Ruler size={14} className="text-blue-500" />
                                {unit.area_total} м2
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Layers3 size={14} className="text-emerald-500" />
                                {unit.rooms} комн. • {unit.floor?.floor_number} этаж
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CircleDollarSign size={14} className="text-orange-500" />
                                {formatCurrency(unit.price_total)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        {/* {isUnitOffSale ? (
                            <button
                                type="button"
                                title="Вернуть в свободные"
                                onClick={onReturnToFree}
                                disabled={actionLoading}
                                className="flex items-center justify-center w-8 h-8 text-white transition rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Home size={14} />
                            </button>
                        ) : null} */}
                        <StyledTooltip title="Редактировать лот">
                            <button
                                type="button"
                                // onClick={onEditUnit}
                                // disabled={actionLoading}
                                className="flex items-center justify-center text-white transition rounded-lg w-7 h-7 bg-sky-500 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Pencil size={14} />
                            </button>
                        </StyledTooltip>
                        <StyledTooltip title="Закрыть">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex items-center justify-center mr-2 text-white transition bg-red-400 rounded-lg w-7 h-7 hover:bg-red-600"
                            >
                                <X size={16} />
                            </button>
                        </StyledTooltip>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2.5">
                    <InlineMetric
                        icon={<CalendarClock size={15} />}
                        label="Брони"
                        value={String(unit.reservationCount)}
                        tone="orange"
                    />
                    <InlineMetric
                        icon={<FileText size={15} />}
                        label="Сделки"
                        value={String(unit.dealCount)}
                        tone="blue"
                    />
                    <InlineMetric
                        icon={<Wallet size={15} />}
                        label="Оплачено"
                        value={formatCurrency(unit.totalPaid)}
                        tone="green"
                    />
                    <InlineMetric
                        icon={<CircleDollarSign size={15} />}
                        label="Остаток"
                        value={formatCurrency(unit.remaining)}
                        tone="slate"
                    />
                </div>
            </div>
        </div>
    );
}
