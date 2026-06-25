import {
    CalendarClock,
    CircleDollarSign,
    FileText,
    Home,
    Layers3,
    Pencil,
    Plus,
    Ruler,
    Wallet,
    X,
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import type {
    PassportClient,
    PassportDeal,
    PassportPayment,
    PassportPaymentSchedule,
    PassportReservation,
    PassportReservationBrief,
    PassportUnit,
} from '../slices/salesUnitPassportSlice copy';
import { ClientAccordionItem } from './ClientAccordionItem';

export type ClientHistoryGroup = {
    key: string;
    client_id: number | null;
    client: PassportClient | null;
    reservations: (PassportReservation | PassportReservationBrief)[];
    deals: PassportDeal[];
    payments: PassportPayment[];
    latestDate: Date | null;
    status: string;
    statusLabel: string;
};

function InlineMetric({
    icon,
    label,
    value,
    tone,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    tone: 'blue' | 'green' | 'orange' | 'slate';
}) {
    const toneMap = {
        blue: 'bg-blue-50 text-blue-800',
        green: 'bg-emerald-50 text-emerald-800',
        orange: 'bg-orange-50 text-orange-800',
        slate: 'bg-violet-50 text-violet-800',
    };

    return (
        <div className="flex items-center min-w-0 gap-2 px-2 py-2 bg-white border rounded-xl border-stone-200">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${toneMap[tone]}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <div className="text-[12px] leading-none text-slate-500">
                    {label}:{' '}
                    <span className="mt-1 text-sm font-semibold truncate text-slate-700">
                        {value}{' '}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function SalesUnitPassportSidebarHeader({
    unit,
    currentUnitStatus,
    statusToneClass,
    summary,
    isUnitOffSale,
    actionLoading,
    onReturnToFree,
    onEditUnit,
    onClose,
}: {
    unit: PassportUnit;
    currentUnitStatus?: { name?: string | null } | null;
    statusToneClass: string;
    summary: {
        reservationCount: number;
        dealCount: number;
        totalPaid: number;
        remaining: number;
    };
    isUnitOffSale: boolean;
    actionLoading: boolean;
    onReturnToFree: () => void;
    onEditUnit: () => void;
    onClose: () => void;
}) {
    return (
        <div className="bg-white border-b border-stone-200">
            <div className="px-2 pt-1 pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mt-2">
                            <Home size={16} className="text-blue-500" />
                            <h2 className="font-semibold text-slate-800">
                                Квартира {unit.unit_number}
                            </h2>
                            <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusToneClass}`}
                            >
                                {currentUnitStatus?.name || 'Статус'}
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
                        {isUnitOffSale ? (
                            <button
                                type="button"
                                title="Вернуть в свободные"
                                onClick={onReturnToFree}
                                disabled={actionLoading}
                                className="flex items-center justify-center w-8 h-8 text-white transition rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Home size={14} />
                            </button>
                        ) : null}
                        <button
                            type="button"
                            title="Редактировать квартиру"
                            onClick={onEditUnit}
                            disabled={actionLoading}
                            className="flex items-center justify-center w-8 h-8 text-white transition rounded-lg bg-sky-500 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Pencil size={14} />
                        </button>
                        <button
                            type="button"
                            title="Закрыть"
                            onClick={onClose}
                            className="flex items-center justify-center w-8 h-8 text-white transition bg-red-500 rounded-lg hover:bg-red-600"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2.5">
                    <InlineMetric
                        icon={<CalendarClock size={15} />}
                        label="Брони"
                        value={String(summary.reservationCount)}
                        tone="orange"
                    />
                    <InlineMetric
                        icon={<FileText size={15} />}
                        label="Сделки"
                        value={String(summary.dealCount)}
                        tone="blue"
                    />
                    <InlineMetric
                        icon={<Wallet size={15} />}
                        label="Оплачено"
                        value={formatCurrency(summary.totalPaid)}
                        tone="green"
                    />
                    <InlineMetric
                        icon={<CircleDollarSign size={15} />}
                        label="Остаток"
                        value={formatCurrency(summary.remaining)}
                        tone="slate"
                    />
                </div>
            </div>
        </div>
    );
}

export function SalesUnitPassportHistoryPanel({
    clientHistory,
    expandedKeys,
    hasActiveReservation,
    onToggleGroup,
    onCreateReservation,
    onCreateDeal,
    onEditReservation,
    onCancelReservation,
    onPaymentClick,
    onScheduleClick,
    onEditDeal,
    onSignDeal,
    onCancelDeal,
    onDealFiles,
    onDownloadScheduleClick,
    downloadingScheduleDealId,
    getReservationStatusName,
    getDealStatusName,
    isActiveReservation,
    canSignDeal,
    canCancelDeal,
    getDealPayments,
    getDealSchedules,
    getReservationPayments,
    getSingleReservationPayments,
}: {
    clientHistory: ClientHistoryGroup[];
    expandedKeys: string[];
    hasActiveReservation: boolean;
    onToggleGroup: (groupKey: string) => void;
    onCreateReservation: (
        context?:
            | PassportReservation
            | PassportReservationBrief
            | { client_id?: number | null }
            | null,
    ) => void;
    onCreateDeal: (defaults?: {
        client_id?: number | null;
        reservation_id?: number | null;
    }) => void;
    onEditReservation: (reservation: PassportReservation | PassportReservationBrief) => void;
    onCancelReservation: (reservation: PassportReservation | PassportReservationBrief) => void;
    onPaymentClick: (
        context:
            | PassportDeal
            | {
                  reservation?: PassportReservation | PassportReservationBrief | null;
                  reservation_id?: number | string | null;
                  client_id?: number | string | null;
              },
    ) => void;
    onScheduleClick: (deal: PassportDeal) => void;
    onEditDeal: (deal: PassportDeal) => void;
    onSignDeal: (deal: PassportDeal) => void;
    onCancelDeal: (deal: PassportDeal) => void;
    onDealFiles: (deal: PassportDeal) => void;
    onDownloadScheduleClick: (deal: PassportDeal) => void;
    downloadingScheduleDealId: number | null;
    getReservationStatusName: (value: PassportReservation | PassportReservationBrief) => string;
    getDealStatusName: (value: PassportDeal) => string;
    isActiveReservation: (reservation: PassportReservation | PassportReservationBrief) => boolean;
    canSignDeal: (deal: PassportDeal) => boolean;
    canCancelDeal: (deal: PassportDeal) => boolean;
    getDealPayments: (dealId: number) => PassportPayment[];
    getDealSchedules: (dealId: number) => PassportPaymentSchedule[];
    getReservationPayments: (group: ClientHistoryGroup) => PassportPayment[];
    getSingleReservationPayments: (
        reservation: PassportReservation | PassportReservationBrief,
    ) => PassportPayment[];
}) {
    return (
        <div className="flex-1 px-2 py-2 overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">История клиента</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                        История брони, сделки, платежей, и по графику платежей
                    </p>
                </div>

                {clientHistory.length ? (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                            onClick={() => onCreateDeal()}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-white transition bg-emerald-600 rounded-lg h-8 px-3.5 hover:bg-emerald-700 active:scale-95 shadow-sm"
                        >
                            <Plus size={14} />
                            Выкуп
                        </button>

                        {!hasActiveReservation ? (
                            <button
                                onClick={() => onCreateReservation()}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-white transition bg-blue-600 rounded-lg h-8 px-3.5 hover:bg-blue-700 active:scale-95 shadow-sm"
                            >
                                <Plus size={14} />
                                Создать бронь
                            </button>
                        ) : null}
                    </div>
                ) : null}
            </div>

            {clientHistory.length > 0 ? (
                <div className="space-y-3">
                    {clientHistory.map((group) => (
                        <ClientAccordionItem
                            key={group.key}
                            group={group}
                            isExpanded={expandedKeys.includes(group.key)}
                            onToggle={() => onToggleGroup(group.key)}
                            onCreateReservation={onCreateReservation}
                            onCreateDeal={onCreateDeal}
                            onEditReservation={onEditReservation}
                            onCancelReservation={onCancelReservation}
                            onPaymentClick={onPaymentClick}
                            onScheduleClick={onScheduleClick}
                            onEditDeal={onEditDeal}
                            onSignDeal={onSignDeal}
                            onCancelDeal={onCancelDeal}
                            onDealFiles={onDealFiles}
                            onDownloadScheduleClick={onDownloadScheduleClick}
                            downloadingScheduleDealId={downloadingScheduleDealId}
                            getReservationStatusName={getReservationStatusName}
                            getDealStatusName={getDealStatusName}
                            isActiveReservation={isActiveReservation}
                            hasActiveReservation={hasActiveReservation}
                            canSignDeal={canSignDeal}
                            canCancelDeal={canCancelDeal}
                            getDealPayments={getDealPayments}
                            getDealSchedules={getDealSchedules}
                            getReservationPayments={getReservationPayments}
                            getSingleReservationPayments={getSingleReservationPayments}
                        />
                    ))}
                </div>
            ) : (
                <div className="px-4 py-6 text-center bg-white border border-dashed rounded-2xl border-stone-300">
                    <p className="text-sm text-rose-400">По квартире пока нет истории клиентов</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                        <button
                            onClick={() => onCreateDeal()}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-white transition bg-emerald-600 rounded-lg h-8 px-3.5 hover:bg-emerald-700 active:scale-95 shadow-sm"
                        >
                            <Plus size={14} />
                            Выкуп
                        </button>

                        {!hasActiveReservation ? (
                            <button
                                onClick={() => onCreateReservation()}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-white transition bg-blue-600 rounded-lg h-8 px-3.5 hover:bg-blue-700 active:scale-95 shadow-sm"
                            >
                                <Plus size={14} />
                                Создать бронь
                            </button>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
