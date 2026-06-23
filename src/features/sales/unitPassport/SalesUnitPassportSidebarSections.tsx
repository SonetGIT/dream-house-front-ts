import {
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
import { formatCurrency } from '@/utils/formatCurrency';
import type {
    PassportClient,
    PassportDeal,
    PassportPayment,
    PassportPaymentSchedule,
    PassportReservation,
    PassportReservationBrief,
} from '../slices/salesUnitPassportSlice';
import { ClientAccordionItem } from './ClientAccordionItem';
import {
    HeaderIconAction,
    PrimaryButton,
    SecondaryButton,
} from './SalesUnitPassportUI';

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
        <div className="flex items-center min-w-0 gap-2 rounded-xl border border-stone-200 bg-white px-2 py-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${toneMap[tone]}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <div className="text-[12px] leading-none text-slate-500">
                    {label}:{' '}
                    <span className="mt-1 truncate text-sm font-semibold text-slate-700">
                        {value}{' '}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function SalesUnitPassportSidebarHeader({
    unitNumber,
    areaTotal,
    rooms,
    floorNumber,
    priceTotal,
    statusName,
    statusToneClass,
    summary,
    isUnitOffSale,
    actionLoading,
    onReturnToFree,
    onEditUnit,
    onClose,
}: {
    unitNumber: string | number;
    areaTotal: string | number | null | undefined;
    rooms: string | number | null | undefined;
    floorNumber: string | number | null | undefined;
    priceTotal: string | number | null | undefined;
    statusName?: string | null;
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
        <div className="border-b border-stone-200 bg-white">
            <div className="px-2 pb-4 pt-1">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="mt-2 flex items-center gap-2">
                            <Home size={16} className="text-blue-500" />
                            <h2 className="font-semibold text-slate-800">Квартира {unitNumber}</h2>
                            <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusToneClass}`}
                            >
                                {statusName || 'Статус'}
                            </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-5 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                                <Ruler size={14} className="text-blue-500" />
                                {areaTotal} м2
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Layers3 size={14} className="text-emerald-500" />
                                {rooms} комн. • {floorNumber} этаж
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CircleDollarSign size={14} className="text-orange-500" />
                                {formatCurrency(priceTotal)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        {isUnitOffSale ? (
                            <HeaderIconAction
                                title="Вернуть в свободные"
                                icon={<Home size={14} />}
                                className="bg-emerald-500 hover:bg-emerald-600"
                                onClick={onReturnToFree}
                                disabled={actionLoading}
                            />
                        ) : null}
                        <HeaderIconAction
                            title="Редактировать квартиру"
                            icon={<Pencil size={14} />}
                            className="bg-sky-500 hover:bg-sky-600"
                            onClick={onEditUnit}
                            disabled={actionLoading}
                        />
                        <HeaderIconAction
                            title="Закрыть"
                            icon={<X size={16} />}
                            className="bg-red-500 hover:bg-red-600"
                            onClick={onClose}
                        />
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
}: {
    clientHistory: ClientHistoryGroup[];
    expandedKeys: string[];
    onToggleGroup: (groupKey: string) => void;
    onCreateReservation: (context?: PassportReservation | PassportReservationBrief | { client_id?: number | null } | null) => void;
    onCreateDeal: (defaults?: { client_id?: number | null; reservation_id?: number | null }) => void;
    onEditReservation: (reservation: PassportReservation | PassportReservationBrief) => void;
    onCancelReservation: (reservation: PassportReservation | PassportReservationBrief) => void;
    onPaymentClick: (deal: PassportDeal) => void;
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
}) {
    return (
        <div className="flex-1 overflow-y-auto px-2 py-2">
            <div className="mb-3">
                <h3 className="text-sm font-semibold text-slate-800">История клиента</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                    История брони, сделки, платежей, и по графику платежей
                </p>
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
                            canSignDeal={canSignDeal}
                            canCancelDeal={canCancelDeal}
                            getDealPayments={getDealPayments}
                            getDealSchedules={getDealSchedules}
                            getReservationPayments={getReservationPayments}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-6 text-center">
                    <p className="text-sm text-rose-400">
                        По квартире пока нет истории клиентов
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        <PrimaryButton onClick={() => onCreateDeal()}>
                            + Выкуп
                        </PrimaryButton>
                        <SecondaryButton onClick={() => onCreateReservation()}>
                            Создать бронь
                        </SecondaryButton>
                    </div>
                </div>
            )}
        </div>
    );
}
