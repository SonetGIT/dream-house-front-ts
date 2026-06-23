import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useReference } from '@/features/reference/useReference';
import { apiRequest } from '@/utils/apiRequest';
import { parseNumber } from '@/utils/parseNumber';
import {
    createDocument,
    fetchDocuments,
    type Document,
} from '@/features/projects/documents/documentsSlice';
import {
    createPayment,
    fetchPaymentArticles,
    fetchPaymentTypes,
    paymentCounterpartyTypes as fetchPaymentCounterpartyTypes,
} from '@/features/projects/payments/paymentSlice';
import {
    deleteDocumentFile,
    downloadDocumentFile,
    fetchDocumentFiles,
    uploadDocumentFile,
    type DocumentFile,
} from '@/features/projects/legal_department/files/documentFilesSlice';
import { getToken } from '@/features/auth/getToken';
import { REPORT_BASE_URL } from '@/features/projects/pto/workPerformed/workPerformedTs/downloadWorkPerformedReport';
import {
    fetchSalesUnitPassport,
    selectPassport,
    selectPassportLoading,
    selectPassportUnit,
    type PassportDeal,
    type PassportPayment,
    type PassportPaymentSchedule,
    type PassportReservation,
    type PassportReservationBrief,
} from '@/features/sales/slices/salesUnitPassportSlice';
import { fetchSalesClients } from '@/features/sales/slices/salesClientsSlice';
import {
    fetchSalesDealTypes,
    fetchSalesUnitFinishTypes,
    fetchSalesUnitStatuses,
    type SalesDealTypes,
    type SalesUnitStatus,
} from '@/features/sales/slices/salesDictionariesSlice';
import { fetchSalesOverview } from '@/features/sales/slices/salesObjOverviewSlice';
import { updateSalesUnit, type SalesUnit } from '@/features/sales/slices/salesUnitsSlice';
import { generateSalesPaymentSchedule } from '@/features/sales/slices/salesPaymentSchedulesSlice';
import { ObjectsOverviewUnitForm } from '../objectsOverviewUnits/ObjectsOverviewUnitForm';
import {
    SalesUnitPassportHistoryPanel,
    SalesUnitPassportSidebarHeader,
    type ClientHistoryGroup,
} from './SalesUnitPassportSidebarSections';
import {
    DealFilesModal,
    DealModal,
    PaymentModal,
    ReservationModal,
    ScheduleModal,
} from './SalesUnitPassportModals';
import { salesUnitPassportLogic } from './salesUnitPassportLogic';

const EMPTY_DEAL_FORM = {
    client_id: '',
    reservation_id: '',
    deal_type_id: '',
    contract_number: '',
    contract_date: '',
    payment_type: '',
    total_amount: '',
    currency: '',
    note: '',
};

const EMPTY_PAYMENT_FORM = {
    deal_id: '',
    title: '',
    amount: '',
    currency: '',
    planned_date: '',
    paid_date: '',
};

const EMPTY_SCHEDULE_FORM = {
    deal_id: '',
    start_date: '',
    payments_count: '12',
    interval_months: '1',
    payment_day: '',
    first_payment_amount: '',
    total_amount: '',
    comment: '',
};

const EMPTY_ARRAY: never[] = [];

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

const isOffSaleStatus = (
    status: Pick<SalesUnitStatus, 'code' | 'name'> | null | undefined,
) => {
    const code = String(status?.code || '').toLowerCase();
    const name = String(status?.name || '').toLowerCase();

    return (
        [
            'off_sale',
            'off_market',
            'offmarket',
            'not_for_sale',
            'withdrawn',
            'removed',
            'inactive',
        ].includes(code) ||
        name.includes('снят') ||
        name.includes('продаж')
    );
};

const toDateInput = (value?: string | Date | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
};

const formatEditableNumber = (value: unknown) => {
    if (value === null || value === undefined || value === '') return '';
    const numeric = Number(value);
    return Number.isFinite(numeric) ? String(numeric) : String(value);
};

const toNullableNumber = (value: string) => {
    const normalized = String(value || '')
        .trim()
        .replace(',', '.');
    if (!normalized) return null;
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? numeric : null;
};

const getFileNameFromContentDisposition = (contentDisposition: string | null, fallback: string) => {
    if (!contentDisposition) return fallback;

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        try {
            return decodeURIComponent(utf8Match[1]);
        } catch {
            return utf8Match[1];
        }
    }

    const regularMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    return regularMatch?.[1] || fallback;
};

const getMonthDiff = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 1;
    const diff =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());
    return Math.max(diff || 1, 1);
};

export default function SalesUnitPasportSidbar({
    unitId,
    onClose,
}: {
    unitId: number;
    onClose: () => void;
}) {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector((state) => state.auth.user);
    const passport = useAppSelector(selectPassport);
    const passportLoading = useAppSelector(selectPassportLoading);
    const passportUnit = useAppSelector(selectPassportUnit);
    const { projects, blocks } = useAppSelector((state) => state.salesObjOverview);
    const clients = useAppSelector((state) => state.salesClients?.items ?? EMPTY_ARRAY);
    const dealTypes = useAppSelector((state) => state.salesDictionaries?.dealTypes ?? EMPTY_ARRAY);
    const unitStatuses = useAppSelector(
        (state) => state.salesDictionaries?.unitStatuses ?? EMPTY_ARRAY,
    );
    const finishTypes = useAppSelector(
        (state) => state.salesDictionaries?.finishTypes ?? EMPTY_ARRAY,
    );
    const paymentTypes = useAppSelector((state) => state.payments?.types ?? EMPTY_ARRAY);
    const paymentArticles = useAppSelector((state) => state.payments?.articles ?? EMPTY_ARRAY);
    const counterpartyTypes = useAppSelector(
        (state) => state.payments?.counterpartyTypes ?? EMPTY_ARRAY,
    );

    const currenciesRef = useReference('currencies');
    const dealStatusesRef = useReference('dealStatuses');
    const reservationStatusesRef = useReference('reservationStatuses');
    const dealPaymentTypesRef = useReference('dealPaymentTypes');

    const currencies = currenciesRef.data ?? EMPTY_ARRAY;
    const dealStatuses = dealStatusesRef.data ?? EMPTY_ARRAY;
    const reservationStatuses = reservationStatusesRef.data ?? EMPTY_ARRAY;
    const dealPaymentTypes = dealPaymentTypesRef.data ?? EMPTY_ARRAY;

    const {
        reservations,
        deals,
        payments,
        paymentSchedules,
        clientHistory,
        getReservationStatusName,
        getDealStatusName,
        isActiveReservation,
    } = salesUnitPassportLogic(passport, reservationStatuses, dealStatuses);

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
    const [editUnitOpen, setEditUnitOpen] = useState(false);
    const [dealModalOpen, setDealModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [dealFilesOpen, setDealFilesOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [filesLoading, setFilesLoading] = useState(false);
    const [downloadingScheduleDealId, setDownloadingScheduleDealId] = useState<number | null>(null);
    const [editingReservation, setEditingReservation] = useState<PassportReservation | PassportReservationBrief | null>(null);
    const [editingDeal, setEditingDeal] = useState<PassportDeal | null>(null);
    const [dealForm, setDealForm] = useState(EMPTY_DEAL_FORM);
    const [paymentForm, setPaymentForm] = useState(EMPTY_PAYMENT_FORM);
    const [scheduleForm, setScheduleForm] = useState(EMPTY_SCHEDULE_FORM);
    const [dealFilesContext, setDealFilesContext] = useState<{
        deal: PassportDeal | null;
        documentId: number | null;
        files: DocumentFile[];
    }>({
        deal: null,
        documentId: null,
        files: [],
    });

    useEffect(() => {
        if (unitId) {
            dispatch(fetchSalesUnitPassport(unitId));
            dispatch(fetchSalesClients({ page: 1, size: 200 }));
            dispatch(fetchSalesUnitStatuses());
            dispatch(fetchSalesUnitFinishTypes());
            dispatch(fetchSalesDealTypes());
            dispatch(fetchPaymentTypes());
            dispatch(fetchPaymentArticles());
            dispatch(fetchPaymentCounterpartyTypes());
        }
    }, [dispatch, unitId]);

    const defaultCurrencyId = useMemo(() => {
        const kgs = currencies.find((item) => String(item.name || '').toUpperCase() === 'KGS');
        return String(kgs?.id || currencies[0]?.id || '');
    }, [currencies]);

    const activeReservation = useMemo(
        () =>
            reservations.find((item: PassportReservation | PassportReservationBrief) =>
                isActiveReservation(item),
            ) || null,
        [reservations, isActiveReservation],
    );

    const dealReservationOptions = useMemo(() => {
        const selectedReservationId = Number(dealForm.reservation_id || 0);
        return reservations.filter((item: PassportReservation | PassportReservationBrief) => {
            if (isActiveReservation(item)) return true;
            return selectedReservationId > 0 && Number(item.id) === selectedReservationId;
        });
    }, [dealForm.reservation_id, isActiveReservation, reservations]);

    const incomePaymentType = useMemo(
        () => paymentTypes.find((item: any) => item.code === 'income') || paymentTypes[0] || null,
        [paymentTypes],
    );

    const salePaymentArticle = useMemo(() => {
        return (
            paymentArticles.find((item: any) => item.code === 'sale_apartment_income') ||
            paymentArticles.find(
                (item: any) => Number(item.payment_type) === Number(incomePaymentType?.id),
            ) ||
            paymentArticles[0] ||
            null
        );
    }, [incomePaymentType?.id, paymentArticles]);

    const clientCounterpartyType = useMemo(
        () =>
            counterpartyTypes.find((item: any) => item.code === 'client') ||
            counterpartyTypes[0] ||
            null,
        [counterpartyTypes],
    );

    const unitStatusMap = useMemo(() => {
        const map = new Map<number, SalesUnitStatus>();
        unitStatuses.forEach((item) => {
            map.set(Number(item.id), item);
        });
        return map;
    }, [unitStatuses]);

    const currentUnitStatus = useMemo(
        () => passportUnit?.status || unitStatusMap.get(Number(passportUnit?.status_id)) || null,
        [passportUnit?.status, passportUnit?.status_id, unitStatusMap],
    );

    const isUnitOffSale = useMemo(
        () => isOffSaleStatus(currentUnitStatus),
        [currentUnitStatus],
    );

    const freeUnitStatus = useMemo(
        () =>
            unitStatuses.find(
                (item) => String(item.code || '').toLowerCase() === 'free',
            ) ||
            unitStatuses.find((item) =>
                String(item.name || '')
                    .toLowerCase()
                    .includes('свобод'),
            ) ||
            null,
        [unitStatuses],
    );

    const statusTextHas = (item: any, parts: string[]) => {
        const value = String(item?.name || '').toLowerCase();
        return parts.some((part) => value.includes(part));
    };

    const getDealStatusIdByKey = (key: 'draft' | 'active' | 'signed' | 'closed' | 'canceled') => {
        const keywords = {
            draft: ['draft', 'чернов'],
            active: ['active', 'актив'],
            signed: ['signed', 'подпис'],
            closed: ['closed', 'закры'],
            canceled: ['cancel', 'отмен'],
        };
        const match = dealStatuses.find((item) => statusTextHas(item, keywords[key]));
        const fallback = { draft: 1, active: 2, signed: 3, closed: 4, canceled: 5 };
        return Number(match?.id || fallback[key] || 0);
    };

    const getDealStatusCode = (deal: PassportDeal | null | undefined) => {
        const statusRow =
            deal?.status_ref ||
            dealStatuses.find((item) => Number(item.id) === Number(deal?.status || 0)) ||
            null;

        const mapped =
            statusRow?.code ||
            statusRow?.name ||
            '';

        return String(mapped).toLowerCase();
    };

    const canSignDeal = (deal: PassportDeal | null | undefined) => {
        if (!deal?.id) return false;

        const statusCode = getDealStatusCode(deal);
        return !['signed', 'closed', 'canceled', 'cancelled'].includes(statusCode);
    };

    const canCancelDeal = (deal: PassportDeal | null | undefined) => {
        if (!deal?.id) return false;

        const statusCode = getDealStatusCode(deal);
        return !['closed', 'canceled', 'cancelled'].includes(statusCode);
    };

    const getReservationStatusIdByKey = (key: 'active' | 'closed' | 'canceled') => {
        const keywords = {
            active: ['active', 'Р°РєС‚РёРІ'],
            closed: ['closed', 'Р·Р°РєСЂС‹', 'РїРѕРґРїРёСЃ'],
            canceled: ['canceled', 'cancel', 'РѕС‚РјРµРЅ', 'СЃРЅСЏС‚'],
        };
        const match = reservationStatuses.find((item) => statusTextHas(item, keywords[key]));
        const fallback = { active: 1, closed: 2, canceled: 3 };
        return Number(match?.id || fallback[key] || 0);
    };

    const getPreferredDealTypeId = () => {
        const match = (dealTypes as SalesDealTypes[]).find((type) => {
            const code = String(type.code || '').toLowerCase();
            const name = String(type.name || '').toLowerCase();
            return (
                ['buyout', 'sale', 'regular'].includes(code) ||
                ['выкуп', 'обыч', 'продаж'].some((part) => name.includes(part))
            );
        });
        return String(match?.id || dealTypes[0]?.id || '');
    };

    const getPreferredDealPaymentTypeId = () => {
        const match = dealPaymentTypes.find((type) => {
            const name = String(type.name || '').toLowerCase();
            return ['пол', 'выкуп', 'един', 'нал'].some((part) => name.includes(part));
        });
        return String(match?.id || dealPaymentTypes[0]?.id || '');
    };

    const getClientName = (clientId: number | string | null | undefined, fallback = 'Клиент') => {
        const client = clients.find((item: any) => Number(item.id) === Number(clientId));
        return client?.full_name || client?.phone || fallback;
    };

    const refreshPassport = async () => {
        await dispatch(fetchSalesUnitPassport(unitId));
    };

    const canManageReservation = (reservation: PassportReservation | PassportReservationBrief | null) => {
        if (!reservation) return false;
        if (!isActiveReservation(reservation)) return false;

        const hasSignedDeal = deals.some(
            (deal: PassportDeal) =>
                Number(deal.reservation_id) === Number(reservation.id) &&
                ['active', 'signed', 'closed'].includes(
                    String(deal.status_ref?.code || '').toLowerCase(),
                ),
        );
        if (hasSignedDeal) return false;

        if (Number(currentUser?.role_id) === 1) return true;

        const currentUserId = Number(currentUser?.id || 0);
        return Boolean(
            currentUserId &&
                (Number(reservation.manager_user_id) === currentUserId ||
                    Number(reservation.created_by) === currentUserId),
        );
    };

    const normalizeEntityType = (value: unknown) => String(value || '').toLowerCase();

    const isPaymentForDeal = (payment: PassportPayment, deal: PassportDeal | undefined) => {
        if (!payment || !deal?.id) return false;
        const entityType = normalizeEntityType(
            payment.entity_type_code || payment.entity_type_ref?.code || payment.entity_type,
        );
        if (entityType === 'salesdeal' && Number(payment.entity_id) === Number(deal.id)) {
            return true;
        }

        const contractNumber = String(deal.contract_number || deal.deal_number || '')
            .trim()
            .toLowerCase();
        if (!contractNumber) return false;

        return String(payment.title || payment.description || '')
            .toLowerCase()
            .includes(contractNumber);
    };

    const getDealPayments = (dealId: number) => {
        const deal = deals.find((item: PassportDeal) => Number(item.id) === Number(dealId));
        if (Array.isArray(deal?.payments) && deal.payments.length) {
            return [...deal.payments].sort(
                (a, b) =>
                    new Date(b.paid_date || b.planned_date || b.created_at).getTime() -
                    new Date(a.paid_date || a.planned_date || a.created_at).getTime(),
            );
        }

        return payments.filter((payment: PassportPayment) => isPaymentForDeal(payment, deal));
    };

    const getDealSchedules = (dealId: number) => {
        const direct = deals.find(
            (item: PassportDeal) => Number(item.id) === Number(dealId),
        )?.payment_schedules;
        const rows =
            Array.isArray(direct) && direct.length
                ? direct
                : paymentSchedules.filter(
                      (item: PassportPaymentSchedule) => Number(item.deal_id) === Number(dealId),
                  );

        return [...rows].sort((a, b) => {
            const diff =
                new Date(a.planned_date || a.created_at).getTime() -
                new Date(b.planned_date || b.created_at).getTime();
            if (diff !== 0) return diff;
            return Number(a.payment_no || a.id || 0) - Number(b.payment_no || b.id || 0);
        });
    };

    const getReservationPayments = (group: any) => {
        const nested = (group?.reservations || []).flatMap(
            (reservation: PassportReservation) => reservation.payments || [],
        );
        if (nested.length) {
            return [...nested].sort(
                (a, b) =>
                    new Date(b.paid_date || b.planned_date || b.created_at).getTime() -
                    new Date(a.paid_date || a.planned_date || a.created_at).getTime(),
            );
        }

        return (group?.payments || []).filter((payment: PassportPayment) =>
            (group?.reservations || []).some(
                (reservation: PassportReservationBrief) =>
                    normalizeEntityType(
                        payment.entity_type_code ||
                            payment.entity_type_ref?.code ||
                            payment.entity_type,
                    ) === 'salesreservation' &&
                    Number(payment.entity_id) === Number(reservation.id),
            ),
        );
    };

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
                        getDealPayments(deal.id).reduce(
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
    }, [clientHistory, payments]);

    const openEditUnitModal = () => {
        if (!passportUnit) return;
        if (!projects.length || !blocks.length) {
            dispatch(fetchSalesOverview({ page: 1, size: 1 }));
        }
        if (!finishTypes.length) {
            dispatch(fetchSalesUnitFinishTypes());
        }
        setEditUnitOpen(true);
    };

    const openReservationModal = (
        context?: PassportReservation | PassportReservationBrief | { client_id?: number | null } | null,
    ) => {
        const reservation =
            context && 'start_at' in context ? (context as PassportReservation | PassportReservationBrief) : null;
        const defaults =
            context && !('start_at' in context) ? (context as { client_id?: number | null }) : null;

        if (!reservation && activeReservation) {
            toast.error('По этой квартире уже есть активная бронь');
            return;
        }

        if (reservation && !canManageReservation(reservation)) {
            toast.error('Редактировать бронь может только ее менеджер или администратор');
            return;
        }

        setEditingReservation(reservation);
        setResForm({
            client_id: reservation?.client_id
                ? String(reservation.client_id)
                : defaults?.client_id
                  ? String(defaults.client_id)
                  : '',
            start_at: reservation ? toDateInput(reservation.start_at) : '',
            expires_at: reservation ? toDateInput(reservation.expires_at) : '',
            reservation_amount: reservation
                ? formatEditableNumber(reservation.reservation_amount)
                : '',
            currency: reservation?.currency
                ? String(reservation.currency)
                : passportUnit?.currency
                  ? String(passportUnit.currency)
                  : defaultCurrencyId,
            comment: reservation?.comment || '',
        });
        setReservationModalOpen(true);
    };

    const returnUnitToFree = async () => {
        if (!passportUnit?.id) return;
        if (!freeUnitStatus?.id) {
            toast.error('Статус "Свободно" не найден');
            return;
        }

        setActionLoading(true);
        try {
            await dispatch(
                updateSalesUnit({
                    id: passportUnit.id,
                    payload: {
                        status_id: Number(freeUnitStatus.id),
                    },
                }),
            ).unwrap();

            toast.success('Квартира снова свободна');
            await refreshPassport();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Не удалось вернуть квартиру в свободные',
            );
        } finally {
            setActionLoading(false);
        }
    };

    const openCreateDealModal = (defaults?: {
        client_id?: number | null;
        reservation_id?: number | null;
    }) => {
        setEditingDeal(null);
        setDealForm({
            ...EMPTY_DEAL_FORM,
            client_id: defaults?.client_id ? String(defaults.client_id) : '',
            reservation_id: defaults?.reservation_id ? String(defaults.reservation_id) : '',
            deal_type_id: getPreferredDealTypeId(),
            contract_date: toDateInput(new Date()),
            payment_type: getPreferredDealPaymentTypeId(),
            total_amount: formatEditableNumber(passportUnit?.price_total),
            currency: passportUnit?.currency ? String(passportUnit.currency) : defaultCurrencyId,
            note: '',
        });
        setDealModalOpen(true);
    };

    const openEditDealModal = (deal: PassportDeal) => {
        setEditingDeal(deal);
        setDealForm({
            client_id: deal.client_id ? String(deal.client_id) : '',
            reservation_id: deal.reservation_id ? String(deal.reservation_id) : '',
            deal_type_id: deal.deal_type_id ? String(deal.deal_type_id) : '',
            contract_number: deal.contract_number || '',
            contract_date: toDateInput(deal.contract_date),
            payment_type: deal.payment_type ? String(deal.payment_type) : '',
            total_amount: formatEditableNumber(deal.total_amount),
            currency: deal.currency ? String(deal.currency) : defaultCurrencyId,
            note: deal.note || '',
        });
        setDealModalOpen(true);
    };

    const saveDeal = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!passportUnit?.id) return;

        setActionLoading(true);
        try {
            const selectedReservation = dealForm.reservation_id
                ? reservations.find(
                      (item: PassportReservation | PassportReservationBrief) =>
                          Number(item.id) === Number(dealForm.reservation_id),
                  )
                : null;

            if (!dealForm.client_id) {
                throw new Error('Выберите клиента');
            }

            if (
                selectedReservation &&
                !isActiveReservation(selectedReservation) &&
                Number(selectedReservation.id) !== Number(editingDeal?.reservation_id)
            ) {
                throw new Error('Новый договор можно создать только по активной брони');
            }

            if (!editingDeal && activeReservation && !dealForm.reservation_id) {
                throw new Error('По квартире есть активная бронь, выберите ее для договора');
            }

            const payload = {
                unit_id: Number(passportUnit.id),
                client_id: Number(dealForm.client_id),
                reservation_id: dealForm.reservation_id ? Number(dealForm.reservation_id) : null,
                deal_type_id: dealForm.deal_type_id ? Number(dealForm.deal_type_id) : null,
                status: Number(editingDeal?.status || getDealStatusIdByKey('draft')),
                deal_number: editingDeal?.deal_number || null,
                contract_number: dealForm.contract_number.trim() || null,
                contract_date: dealForm.contract_date || null,
                payment_type: dealForm.payment_type ? Number(dealForm.payment_type) : null,
                total_amount: toNullableNumber(dealForm.total_amount),
                currency: dealForm.currency ? Number(dealForm.currency) : null,
                note: dealForm.note.trim() || null,
                canceled_reason: editingDeal?.canceled_reason || null,
            };

            if (editingDeal?.id) {
                await apiRequest(`/sales/deals/update/${editingDeal.id}`, 'PUT', payload);
            } else {
                await apiRequest('/sales/deals/create', 'POST', payload);
            }

            toast.success(editingDeal ? 'Договор обновлен' : 'Договор создан');
            setDealModalOpen(false);
            setEditingDeal(null);
            await refreshPassport();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ошибка сохранения договора');
        } finally {
            setActionLoading(false);
        }
    };

    const changeDealStatus = async (deal: PassportDeal, nextStatus: 'signed' | 'canceled') => {
        if (!deal?.id || !passportUnit?.id) return;

        if (nextStatus === 'signed' && !String(deal.contract_number || '').trim()) {
            toast.error('Для подписания сначала укажите номер договора');
            return;
        }

        setActionLoading(true);
        try {
            const payload = {
                unit_id: Number(deal.unit_id || passportUnit.id),
                client_id: Number(deal.client_id),
                reservation_id: deal.reservation_id ? Number(deal.reservation_id) : null,
                deal_type_id: deal.deal_type_id ? Number(deal.deal_type_id) : null,
                status: getDealStatusIdByKey(nextStatus),
                deal_number: deal.deal_number || null,
                contract_number: String(deal.contract_number || '').trim() || null,
                contract_date: deal.contract_date || null,
                payment_type: deal.payment_type ? Number(deal.payment_type) : null,
                total_amount: toNullableNumber(formatEditableNumber(deal.total_amount)),
                currency: deal.currency ? Number(deal.currency) : null,
                note: String(deal.note || '').trim() || null,
                canceled_reason:
                    nextStatus === 'canceled'
                        ? deal.canceled_reason || 'Отменено из паспорта квартиры'
                        : null,
            };

            await apiRequest(`/sales/deals/update/${deal.id}`, 'PUT', payload);

            if (editingDeal?.id === deal.id) {
                setDealModalOpen(false);
                setEditingDeal(null);
            }

            toast.success(nextStatus === 'signed' ? 'Договор подписан' : 'Договор отменен');
            await refreshPassport();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : nextStatus === 'signed'
                      ? 'Не удалось подписать договор'
                      : 'Не удалось отменить договор',
            );
        } finally {
            setActionLoading(false);
        }
    };

    const openPaymentModal = (deal: PassportDeal) => {
        setPaymentForm({
            ...EMPTY_PAYMENT_FORM,
            deal_id: String(deal.id),
            title: `Платеж по договору №${deal.contract_number || deal.id}`,
            currency: deal.currency ? String(deal.currency) : defaultCurrencyId,
        });
        setPaymentModalOpen(true);
    };

    const savePayment = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!passportUnit?.project_id || !passportUnit?.block_id) return;

        setActionLoading(true);
        try {
            const selectedDeal = deals.find(
                (item: PassportDeal) => Number(item.id) === Number(paymentForm.deal_id),
            );

            if (!selectedDeal?.id) {
                throw new Error('Выберите договор');
            }

            const amount = toNullableNumber(paymentForm.amount);
            if (!amount || amount <= 0) {
                throw new Error('Укажите сумму платежа');
            }

            if (!incomePaymentType?.id) {
                throw new Error('Не найден тип платежа "приход"');
            }

            if (!salePaymentArticle?.id) {
                throw new Error('Не найдена статья платежа для продажи квартиры');
            }

            await dispatch(
                createPayment({
                    project_id: Number(passportUnit.project_id),
                    block_id: Number(passportUnit.block_id),
                    payment_type: Number(incomePaymentType.id),
                    article_id: Number(salePaymentArticle.id),
                    entity_type: 'salesDeal',
                    entity_id: Number(selectedDeal.id),
                    title:
                        paymentForm.title.trim() ||
                        `Платеж по договору №${selectedDeal.contract_number || selectedDeal.id}`,
                    amount,
                    currency: Number(
                        paymentForm.currency || selectedDeal.currency || defaultCurrencyId,
                    ),
                    planned_date: paymentForm.planned_date || null,
                    paid_date: paymentForm.paid_date || null,
                    counterparty_type: clientCounterpartyType?.id
                        ? String(clientCounterpartyType.id)
                        : null,
                    counterparty_id: selectedDeal.client_id || null,
                    counterparty_name: getClientName(
                        selectedDeal.client_id,
                        selectedDeal.client?.full_name || '',
                    ),
                    is_manual: false,
                }),
            ).unwrap();

            toast.success('Платеж создан');
            setPaymentModalOpen(false);
            await refreshPassport();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ошибка создания платежа');
        } finally {
            setActionLoading(false);
        }
    };

    const openScheduleModal = (deal: PassportDeal) => {
        const schedules = getDealSchedules(deal.id);
        const firstSchedule = schedules[0] || null;
        const secondSchedule = schedules[1] || null;
        const startDate =
            firstSchedule?.planned_date || deal.contract_date || toDateInput(new Date());

        setScheduleForm({
            deal_id: String(deal.id),
            start_date: toDateInput(startDate),
            payments_count: String(schedules.length || 12),
            interval_months:
                firstSchedule && secondSchedule
                    ? String(getMonthDiff(firstSchedule.planned_date, secondSchedule.planned_date))
                    : '1',
            payment_day: startDate ? String(new Date(startDate).getDate()) : '',
            first_payment_amount: firstSchedule?.planned_amount
                ? formatEditableNumber(firstSchedule.planned_amount)
                : '',
            total_amount: formatEditableNumber(deal.total_amount || passportUnit?.price_total),
            comment: '',
        });
        setScheduleModalOpen(true);
    };

    const saveSchedule = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setActionLoading(true);
        try {
            const dealId = Number(scheduleForm.deal_id || 0);
            const paymentsCount = Number(scheduleForm.payments_count || 0);
            if (!dealId) throw new Error('Выберите договор');
            if (!paymentsCount || paymentsCount < 1) {
                throw new Error('Укажите количество платежей');
            }

            await dispatch(
                generateSalesPaymentSchedule({
                    deal_id: dealId,
                    start_date: scheduleForm.start_date || toDateInput(new Date()),
                    payments_count: paymentsCount,
                    interval_months: Number(scheduleForm.interval_months || 1),
                    payment_day: scheduleForm.payment_day ? Number(scheduleForm.payment_day) : null,
                    first_payment_amount: scheduleForm.first_payment_amount
                        ? parseNumber(scheduleForm.first_payment_amount)
                        : null,
                    total_amount: scheduleForm.total_amount
                        ? parseNumber(scheduleForm.total_amount)
                        : null,
                    comment: scheduleForm.comment.trim() || null,
                }),
            ).unwrap();

            toast.success('График сформирован');
            setScheduleModalOpen(false);
            await refreshPassport();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ошибка формирования графика');
        } finally {
            setActionLoading(false);
        }
    };

    const downloadScheduleReport = async (deal: PassportDeal) => {
        const token = getToken();
        const fallbackName = `График платежей договор №${deal.contract_number || deal.id}.xlsx`;

        setDownloadingScheduleDealId(Number(deal.id));
        try {
            const response = await fetch(
                `${REPORT_BASE_URL}/report/sales-payment-schedule?dealId=${deal.id}`,
                {
                    method: 'GET',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                },
            );

            const contentType = response.headers.get('Content-Type');
            if (!response.ok) {
                let message = 'Не удалось скачать график платежей';
                if (contentType?.includes('application/json')) {
                    const json = await response.json();
                    message = json?.message || json?.error || message;
                }
                throw new Error(message);
            }

            const blob = await response.blob();
            const fileName = getFileNameFromContentDisposition(
                response.headers.get('Content-Disposition'),
                fallbackName,
            );

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Excel выгружен');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ошибка выгрузки Excel');
        } finally {
            setDownloadingScheduleDealId(null);
        }
    };

    const getOrCreateDealDocument = async (deal: PassportDeal) => {
        const docsResult = await dispatch(
            fetchDocuments({
                entity_type: 'salesDeal',
                entity_id: deal.id,
                page: 1,
                size: 1,
            }),
        ).unwrap();

        const existingDocument = docsResult.data?.[0] as Document | undefined;
        if (existingDocument?.id) {
            return existingDocument;
        }

        const createdDocument = await dispatch(
            createDocument({
                entity_type: 'salesDeal',
                entity_id: deal.id,
                name: `Файлы договора №${deal.contract_number || deal.id}`,
                description: `Документы по квартире ${passportUnit?.unit_number || unitId}`,
                status: 1,
            }),
        ).unwrap();

        return createdDocument;
    };

    const openDealFiles = async (deal: PassportDeal) => {
        setFilesLoading(true);
        try {
            const document = await getOrCreateDealDocument(deal);
            const filesRes = await dispatch(fetchDocumentFiles(document.id)).unwrap();
            setDealFilesContext({
                deal,
                documentId: document.id,
                files: filesRes.data || [],
            });
            setDealFilesOpen(true);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Не удалось открыть файлы договора',
            );
        } finally {
            setFilesLoading(false);
        }
    };

    const handleUploadDealFiles = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (!dealFilesContext.documentId || !files.length) return;

        setFilesLoading(true);
        try {
            for (const file of files) {
                await dispatch(
                    uploadDocumentFile({
                        documentId: dealFilesContext.documentId,
                        file,
                    }),
                ).unwrap();
            }

            const filesRes = await dispatch(
                fetchDocumentFiles(dealFilesContext.documentId),
            ).unwrap();
            setDealFilesContext((prev) => ({
                ...prev,
                files: filesRes.data || [],
            }));
            toast.success('Файлы загружены');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ошибка загрузки файлов');
        } finally {
            event.target.value = '';
            setFilesLoading(false);
        }
    };

    const handleDownloadDealFile = async (file: DocumentFile) => {
        try {
            await dispatch(
                downloadDocumentFile({
                    file_id: file.id,
                    filename: file.name || `file-${file.id}`,
                }),
            ).unwrap();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ошибка скачивания файла');
        }
    };

    const handleDeleteDealFile = async (fileId: number) => {
        if (!window.confirm('Удалить файл?')) return;

        setFilesLoading(true);
        try {
            await dispatch(deleteDocumentFile(fileId)).unwrap();
            setDealFilesContext((prev) => ({
                ...prev,
                files: prev.files.filter((file) => Number(file.id) !== Number(fileId)),
            }));
            toast.success('Файл удален');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ошибка удаления файла');
        } finally {
            setFilesLoading(false);
        }
    };

    const handleSaveReservation = async (event: FormEvent) => {
        event.preventDefault();
        setActionLoading(true);
        try {
            if (!resForm.client_id) {
                throw new Error('Выберите клиента');
            }

            if (!editingReservation && activeReservation) {
                throw new Error('По этой квартире уже есть активная бронь');
            }

            if (editingReservation && !canManageReservation(editingReservation)) {
                throw new Error('Редактировать бронь может только ее менеджер или администратор');
            }

            const payload = {
                unit_id: Number(unitId),
                client_id: Number(resForm.client_id),
                start_at: resForm.start_at || null,
                expires_at: resForm.expires_at || null,
                reservation_amount: toNullableNumber(resForm.reservation_amount),
                currency: resForm.currency ? Number(resForm.currency) : null,
                comment: resForm.comment.trim() || null,
                status: editingReservation
                    ? Number(editingReservation.status || getReservationStatusIdByKey('active'))
                    : getReservationStatusIdByKey('active'),
                cancel_reason: editingReservation?.cancel_reason || null,
            };

            if (editingReservation?.id) {
                await apiRequest(`/sales/reservations/update/${editingReservation.id}`, 'PUT', payload);
            } else {
                await apiRequest('/sales/reservations/create', 'POST', payload);
            }

            toast.success(editingReservation ? 'Бронь обновлена' : 'Бронь создана');
            setEditingReservation(null);
            setReservationModalOpen(false);
            await refreshPassport();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ошибка сохранения брони');
        } finally {
            setActionLoading(false);
        }
    };

    const cancelReservation = async (reservation: PassportReservation | PassportReservationBrief) => {
        if (!reservation?.id) return;
        if (!canManageReservation(reservation)) {
            toast.error('Снять бронь может только ее менеджер или администратор');
            return;
        }

        setActionLoading(true);
        try {
            await apiRequest(`/sales/reservations/update/${reservation.id}`, 'PUT', {
                status: getReservationStatusIdByKey('canceled'),
                cancel_reason: 'Бронь снята менеджером',
            });

            toast.success('Бронь снята');
            await refreshPassport();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Ошибка снятия брони');
        } finally {
            setActionLoading(false);
        }
    };


    if (passportLoading && !passport) {
        return (
            <div className="flex h-full w-[680px] items-center justify-center border-l border-stone-200 bg-[#f8fafc]">
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-500" />
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

    return (
        <div className="flex h-full w-[680px] flex-col overflow-hidden border-l border-stone-200 bg-[#f8fafc] shadow-xl">
            <SalesUnitPassportSidebarHeader
                unitNumber={passportUnit.unit_number}
                areaTotal={passportUnit.area_total}
                rooms={passportUnit.rooms}
                floorNumber={passportUnit.floor?.floor_number}
                priceTotal={passportUnit.price_total}
                statusName={currentUnitStatus?.name}
                statusToneClass={getUnitStatusTone(currentUnitStatus?.code)}
                summary={summary}
                isUnitOffSale={isUnitOffSale}
                actionLoading={actionLoading}
                onReturnToFree={returnUnitToFree}
                onEditUnit={openEditUnitModal}
                onClose={onClose}
            />

            <SalesUnitPassportHistoryPanel
                clientHistory={clientHistory as ClientHistoryGroup[]}
                expandedKeys={expandedKeys}
                onToggleGroup={(groupKey) =>
                    setExpandedKeys((prev) =>
                        prev.includes(groupKey)
                            ? prev.filter((key) => key !== groupKey)
                            : [...prev, groupKey],
                    )
                }
                onCreateReservation={openReservationModal}
                onCreateDeal={openCreateDealModal}
                onEditReservation={openReservationModal}
                onCancelReservation={cancelReservation}
                onPaymentClick={openPaymentModal}
                onScheduleClick={openScheduleModal}
                onEditDeal={openEditDealModal}
                onSignDeal={(deal) => changeDealStatus(deal, 'signed')}
                onCancelDeal={(deal) => changeDealStatus(deal, 'canceled')}
                onDealFiles={openDealFiles}
                onDownloadScheduleClick={downloadScheduleReport}
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

            <ReservationModal
                open={reservationModalOpen}
                unitNumber={passportUnit.unit_number}
                isEditing={Boolean(editingReservation)}
                actionLoading={actionLoading}
                resForm={resForm}
                clients={
                    clients as { id: number | string; full_name?: string | null; phone?: string | null }[]
                }
                currencies={currencies}
                onChange={(patch) => setResForm((prev) => ({ ...prev, ...patch }))}
                onSubmit={handleSaveReservation}
                onClose={() => {
                    setReservationModalOpen(false);
                    setEditingReservation(null);
                }}
            />

            {editUnitOpen && passportUnit && (
                <ObjectsOverviewUnitForm
                    mode="edit"
                    unit={passportUnit as unknown as SalesUnit}
                    unitStatuses={unitStatuses}
                    finishTypes={finishTypes}
                    refs={{ currencies: currenciesRef }}
                    onClose={() => setEditUnitOpen(false)}
                    onSuccess={refreshPassport}
                />
            )}


            <DealModal
                open={dealModalOpen}
                unitNumber={passportUnit.unit_number}
                editingDeal={editingDeal}
                actionLoading={actionLoading}
                dealForm={dealForm}
                clients={clients as { id: number | string; full_name?: string | null; phone?: string | null }[]}
                dealReservationOptions={dealReservationOptions}
                dealTypes={dealTypes as { id: number | string; name?: string | null }[]}
                dealPaymentTypes={dealPaymentTypes}
                currencies={currencies}
                getReservationStatusName={getReservationStatusName}
                onChange={(patch) => setDealForm((prev) => ({ ...prev, ...patch }))}
                onSubmit={saveDeal}
                onClose={() => {
                    setDealModalOpen(false);
                    setEditingDeal(null);
                }}
            />

            <PaymentModal
                open={paymentModalOpen}
                unitNumber={passportUnit.unit_number}
                deals={deals}
                paymentForm={paymentForm}
                currencies={currencies}
                actionLoading={actionLoading}
                onDealChange={(nextDealId) => {
                    const selectedDeal = deals.find(
                        (item: PassportDeal) => Number(item.id) === Number(nextDealId),
                    );
                    setPaymentForm((prev) => ({
                        ...prev,
                        deal_id: nextDealId,
                        title: selectedDeal
                            ? `Платеж по договору №${selectedDeal.contract_number || selectedDeal.id}`
                            : prev.title,
                        currency: selectedDeal?.currency ? String(selectedDeal.currency) : prev.currency,
                    }));
                }}
                onChange={(patch) => setPaymentForm((prev) => ({ ...prev, ...patch }))}
                onSubmit={savePayment}
                onClose={() => setPaymentModalOpen(false)}
            />

            <ScheduleModal
                open={scheduleModalOpen}
                unitNumber={passportUnit.unit_number}
                scheduleForm={scheduleForm}
                actionLoading={actionLoading}
                onChange={(patch) => setScheduleForm((prev) => ({ ...prev, ...patch }))}
                onSubmit={saveSchedule}
                onClose={() => setScheduleModalOpen(false)}
            />

            <DealFilesModal
                open={dealFilesOpen}
                unitNumber={passportUnit.unit_number}
                filesLoading={filesLoading}
                dealFilesContext={dealFilesContext}
                onUpload={handleUploadDealFiles}
                onDownload={handleDownloadDealFile}
                onDelete={handleDeleteDealFile}
                onClose={() => setDealFilesOpen(false)}
            />
        </div>
    );
}
