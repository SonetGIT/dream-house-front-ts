import { useEffect, useMemo, useState } from 'react';
import {
    X,
    Plus,
    Pencil,
    Wallet,
    Home,
    Ruler,
    Layers3,
    CircleDollarSign,
    CalendarClock,
    FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    fetchSalesUnitPassport,
    selectPassport,
    selectPassportLoading,
    selectPassportUnit,
} from '@/features/sales/slices/salesUnitPassportSlice';
import { fetchSalesUnitStatuses } from '@/features/sales/slices/salesDictionariesSlice';
import { fetchSalesClients } from '@/features/sales/slices/salesClientsSlice';
import { salesUnitPassportLogic } from './salesUnitPassportLogic';
import { ClientAccordionItem } from './ClientAccordionItem';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import {
    InputField,
    ModalWrapper,
    PrimaryButton,
    SecondaryButton,
    SelectField,
} from './SalesUnitPassportUI';
import { formatCurrency } from '@/utils/formatCurrency';

const getUnitStatusTone = (code?: string) => {
    const normalized = String(code || '').toLowerCase();

    if (['sold', 'buyout', 'closed'].includes(normalized)) {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }
    if (['reserved', 'reservation', 'booking'].includes(normalized)) {
        return 'border-orange-200 bg-orange-50 text-orange-700';
    }
    return 'border-blue-200 bg-blue-50 text-blue-700';
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

export function HeaderIconAction({
    title,
    icon,
    className,
    onClick,
}: {
    title: string;
    icon: React.ReactNode;
    className: string;
    onClick?: () => void;
}) {
    return (
        <StyledTooltip title={title}>
            <button
                type="button"
                onClick={onClick}
                className={`flex h-6 w-6 items-center justify-center rounded-lg text-white transition ${className}`}
            >
                {icon}
            </button>
        </StyledTooltip>
    );
}

/*******************************************************************************************************************************/
export default function SalesUnitPasportSidbar({
    unitId,
    onClose,
}: {
    unitId: number;
    onClose: () => void;
}) {
    const dispatch = useAppDispatch();
    const passport = useAppSelector(selectPassport);
    const passportLoading = useAppSelector(selectPassportLoading);
    const passportUnit = useAppSelector(selectPassportUnit);
    const clients = useAppSelector((state: any) => state.salesClients?.items) || [];
    const dealStatuses =
        useAppSelector((state: any) => state.salesDictionaries?.dealStatuses) || [];

    const { clientHistory, getReservationStatusName, getDealStatusName, isActiveReservation } =
        salesUnitPassportLogic(passport, undefined, dealStatuses);
    console.log('clientHistory', clientHistory);
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [reservationModalOpen, setReservationModalOpen] = useState(false);
    const [resForm, setResForm] = useState({
        client_id: '',
        start_at: '',
        expires_at: '',
        reservation_amount: '',
        currency: '',
        comment: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (unitId) {
            dispatch(fetchSalesUnitPassport(unitId));
            dispatch(fetchSalesClients({ page: 1, size: 200 }));
            dispatch(fetchSalesUnitStatuses());
        }
    }, [dispatch, unitId]);

    const summary = useMemo(() => {
        const reservationCount = clientHistory.reduce(
            (sum: number, group: any) => sum + (group.reservations?.length || 0),
            0,
        );
        const dealCount = clientHistory.reduce(
            (sum: number, group: any) => sum + (group.deals?.length || 0),
            0,
        );
        const totalDealAmount = clientHistory.reduce(
            (sum: number, group: any) =>
                sum +
                (group.deals || []).reduce(
                    (inner: number, deal: any) => inner + Number(deal.total_amount || 0),
                    0,
                ),
            0,
        );
        const totalPaid = clientHistory.reduce(
            (sum: number, group: any) =>
                sum +
                (group.deals || []).reduce(
                    (inner: number, deal: any) =>
                        inner +
                        (deal.payments || []).reduce(
                            (paySum: number, payment: any) => paySum + Number(payment.amount || 0),
                            0,
                        ),
                    0,
                ),
            0,
        );

        return {
            reservationCount,
            dealCount,
            totalDealAmount,
            totalPaid,
            remaining: Math.max(totalDealAmount - totalPaid, 0),
        };
    }, [clientHistory]);

    const handleSaveReservation = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            toast.success('Бронь сохранена');
            setReservationModalOpen(false);
            dispatch(fetchSalesUnitPassport(unitId));
        } catch {
            toast.error('Ошибка сохранения');
        } finally {
            setIsSaving(false);
        }
    };

    if (passportLoading && !passport) {
        return (
            <div className="flex h-full w-[680px] items-center justify-center border-l border-stone-200 bg-[#f8fafc]">
                <div className="h-10 w-10 rounded-full border-[3px] border-slate-200 border-t-blue-500 animate-spin" />
            </div>
        );
    }

    if (!passportUnit) {
        return (
            <div className="flex h-full w-[680px] items-center justify-center border-l border-stone-200 bg-[#f8fafc] text-slate-500">
                Квартира не найдена
            </div>
        );
    }

    /************************************************************************************************************************************/
    return (
        <div className="flex h-full w-[680px] flex-col overflow-hidden border-l border-stone-200 bg-[#f8fafc] shadow-xl">
            <div className="bg-white border-b border-stone-200">
                <div className="px-2 pt-1 pb-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mt-2">
                                <Home size={16} className="text-blue-500" />
                                <h2 className="font-semibold text-slate-800">
                                    Квартира {passportUnit.unit_number}
                                </h2>
                                <span
                                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getUnitStatusTone(passportUnit.status?.code)}`}
                                >
                                    {passportUnit.status?.name || 'Статус'}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-5 mt-2 text-sm text-slate-500">
                                <span className="inline-flex items-center gap-1.5">
                                    <Ruler size={14} className="text-blue-500" />
                                    {passportUnit.area_total} м²
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Layers3 size={14} className="text-emerald-500" />
                                    {passportUnit.rooms} комн. • {passportUnit.floor?.floor_number}{' '}
                                    этаж
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <CircleDollarSign size={14} className="text-orange-500" />
                                    {formatCurrency(
                                        passportUnit.price_total,
                                        // passportUnit.currency_info?.code || 'сом',
                                    )}
                                </span>
                            </div>
                        </div>
                        {/* КНОПКИ */}
                        <div className="flex items-start gap-2">
                            {/* <HeaderIconAction
                                title="Создать бронь"
                                icon={<Plus size={16} />}
                                className="bg-emerald-500 hover:bg-emerald-600"
                                onClick={() => setReservationModalOpen(true)}
                            /> */}
                            <HeaderIconAction
                                title="Редактировать юнит"
                                icon={<Pencil size={14} />}
                                className="bg-sky-500 hover:bg-sky-600"
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
                            value={formatCurrency(
                                summary.totalPaid /*passportUnit.currency_info?.code*/,
                            )}
                            tone="green"
                        />
                        <InlineMetric
                            icon={<CircleDollarSign size={15} />}
                            label="Остаток"
                            value={formatCurrency(
                                summary.remaining /*passportUnit.currency_info?.code*/,
                            )}
                            tone="slate"
                        />
                    </div>
                </div>
            </div>

            {/* История клиента */}
            <div className="flex-1 px-2 py-2 overflow-y-auto">
                <div className="mb-3">
                    <h3 className="text-sm font-semibold text-slate-800">История клиента</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                        История брони, сделки, платежей, и по графику платежей
                    </p>
                </div>

                {/* ClientAccordionItem */}
                {clientHistory.length > 0 ? (
                    <div className="space-y-3">
                        {clientHistory.map((group: any) => (
                            <ClientAccordionItem
                                key={group.key}
                                group={group}
                                isExpanded={expandedKeys.includes(group.key)}
                                onToggle={() =>
                                    setExpandedKeys((prev) =>
                                        prev.includes(group.key)
                                            ? prev.filter((k) => k !== group.key)
                                            : [...prev, group.key],
                                    )
                                }
                                onEditReservation={() => {}}
                                onCancelReservation={() => {}}
                                onPaymentClick={() => {}}
                                onScheduleClick={() => {}}
                                getReservationStatusName={getReservationStatusName}
                                getDealStatusName={getDealStatusName}
                                isActiveReservation={isActiveReservation}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-6 text-sm text-center bg-white border border-dashed rounded-2xl border-stone-300 text-rose-400">
                        По квартире пока нет истории клиентов
                    </div>
                )}
            </div>

            {reservationModalOpen && (
                <ModalWrapper title="Новая бронь" onClose={() => setReservationModalOpen(false)}>
                    <form onSubmit={handleSaveReservation} className="space-y-4">
                        <SelectField
                            label="Клиент *"
                            value={resForm.client_id}
                            onChange={(e: any) =>
                                setResForm({ ...resForm, client_id: e.target.value })
                            }
                            required
                        >
                            <option value="">Выберите клиента</option>
                            {clients.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c.full_name || c.phone}
                                </option>
                            ))}
                        </SelectField>

                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                label="Начало"
                                type="date"
                                value={resForm.start_at}
                                onChange={(e: any) =>
                                    setResForm({ ...resForm, start_at: e.target.value })
                                }
                            />
                            <InputField
                                label="Окончание"
                                type="date"
                                value={resForm.expires_at}
                                onChange={(e: any) =>
                                    setResForm({ ...resForm, expires_at: e.target.value })
                                }
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <SecondaryButton onClick={() => setReservationModalOpen(false)}>
                                Отмена
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={isSaving}>
                                {isSaving ? 'Сохранение...' : 'Сохранить'}
                            </PrimaryButton>
                        </div>
                    </form>
                </ModalWrapper>
            )}
        </div>
    );
}
