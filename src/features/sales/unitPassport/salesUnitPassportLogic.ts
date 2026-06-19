import { useMemo } from 'react';
import {
    type PassportClient,
    type PassportReservation,
    type PassportDeal,
    type PassportPayment,
    type UnitPassport,
    type PassportReservationBrief,
} from '../slices/salesUnitPassportSlice';
import type { EnumItem } from '@/features/reference/referenceService';

export function salesUnitPassportLogic(
    passport: UnitPassport | null,
    reservationStatuses?: EnumItem[],
    dealStatuses?: EnumItem[],
) {
    // Получаем клиентов из паспорта
    const passportClients = useMemo(() => passport?.unit?.clients || [], [passport]);

    // Собираем все брони, сделки, платежи и графики из вложенных структур клиентов
    const nestedReservations = useMemo(
        () => passportClients.flatMap((client: PassportClient) => client.reservations || []),
        [passportClients],
    );

    const nestedDeals = useMemo(
        () => passportClients.flatMap((client: PassportClient) => client.deals || []),
        [passportClients],
    );

    const nestedPayments = useMemo(
        () =>
            passportClients.flatMap((client: PassportClient) => [
                ...(client.reservations || []).flatMap(
                    (r: PassportReservation) => r.payments || [],
                ),
                ...(client.deals || []).flatMap((d: PassportDeal) => d.payments || []),
            ]),
        [passportClients],
    );

    const nestedPaymentSchedules = useMemo(
        () => passportClients.flatMap((client: PassportClient) => client.payment_schedules || []),
        [passportClients],
    );

    // Функция сортировки (новые сначала)
    const sortRows = (rows: any[], fields: string[]) =>
        [...(rows || [])].sort((a, b) => {
            const getTime = (obj: any) => {
                for (const f of fields) {
                    if (obj?.[f]) {
                        const t = new Date(obj[f]).getTime();
                        if (Number.isFinite(t)) return t;
                    }
                }
                return 0;
            };
            return getTime(b) - getTime(a) || Number(b?.id || 0) - Number(a?.id || 0);
        });

    // Сортированные массивы
    const reservations = useMemo(
        () =>
            sortRows(
                nestedReservations.length ? nestedReservations : passport?.reservations || [],
                ['updated_at', 'created_at', 'start_at'],
            ),
        [nestedReservations, passport?.reservations],
    );

    const deals = useMemo(
        () =>
            sortRows(nestedDeals.length ? nestedDeals : passport?.deals || [], [
                'updated_at',
                'created_at',
                'contract_date',
            ]),
        [nestedDeals, passport?.deals],
    );

    const payments = useMemo(
        () =>
            sortRows(nestedPayments.length ? nestedPayments : passport?.payments || [], [
                'paid_date',
                'planned_date',
                'created_at',
            ]),
        [nestedPayments, passport?.payments],
    );

    const paymentSchedules = useMemo(
        () =>
            sortRows(
                nestedPaymentSchedules.length
                    ? nestedPaymentSchedules
                    : passport?.payment_schedules || [],
                ['updated_at', 'created_at', 'planned_date'],
            ),
        [nestedPaymentSchedules, passport?.payment_schedules],
    );

    // Мапы статусов
    const reservationStatusMap = useMemo(() => {
        const m = new Map<number, EnumItem>();
        reservationStatuses?.forEach((i: EnumItem) => m.set(Number(i.id), i));
        return m;
    }, [reservationStatuses]);

    const dealStatusMap = useMemo(() => {
        const m = new Map<number, EnumItem>();
        dealStatuses?.forEach((i: EnumItem) => m.set(Number(i.id), i));
        return m;
    }, [dealStatuses]);

    // Получение названия статуса брони
    const getReservationStatusName = (
        value: PassportReservation | PassportReservationBrief | any,
    ) => {
        const id = Number(typeof value === 'object' ? value?.status : value);
        return (
            (typeof value === 'object' ? value?.status_ref : null)?.name ||
            reservationStatusMap.get(id)?.name ||
            'Бронь'
        );
    };

    // Получение названия статуса сделки
    const getDealStatusName = (value: PassportDeal | any) => {
        const id = Number(typeof value === 'object' ? value?.status : value);
        return (
            (typeof value === 'object' ? value?.status_ref : null)?.name ||
            dealStatusMap.get(id)?.name ||
            'Договор'
        );
    };

    // Проверка активной брони - работаем с любым типом брони
    const isActiveReservation = (r: PassportReservation | PassportReservationBrief) => {
        // Безопасно получаем status_ref (есть только в PassportReservation)
        const statusRef = 'status_ref' in r ? r.status_ref : null;

        // Получаем статус из status_ref или из map
        const row = statusRef || reservationStatusMap.get(Number(r.status));

        const code = String(row?.code || '').toLowerCase();
        const name = String(row?.name || '').toLowerCase();

        return code === 'active' || name.includes('актив') || Number(r.status) === 1;
    };

    // Проверка подписанной сделки
    // const isSignedDeal = (d: PassportDeal) => {
    //     const row = typeof d === 'object' ? d.status_ref : dealStatusMap.get(Number(d.status));
    //     const code = String(row?.code || '').toLowerCase();
    //     return ['active', 'signed', 'closed'].includes(code) || [2, 3, 4].includes(Number(d.status));
    // };
    const isSignedDeal = (d: any) => {
        const row = typeof d === 'object' ? d.status_ref : dealStatusMap.get(Number(d.status));
        const code = String(row?.code || '').toLowerCase();
        return (
            ['active', 'signed', 'closed'].includes(code) || [2, 3, 4].includes(Number(d.status))
        );
    };

    // Группировка истории клиентов
    const clientHistory = useMemo(() => {
        const groups = new Map<string, any>();

        const ensureGroup = (clientId: number | null, client: PassportClient | null = null) => {
            const key = clientId ? `client-${clientId}` : 'client-empty';
            if (!groups.has(key)) {
                groups.set(key, {
                    key,
                    client_id: clientId,
                    client,
                    reservations: [] as (PassportReservation | PassportReservationBrief)[],
                    deals: [] as PassportDeal[],
                    payments: [] as PassportPayment[],
                    latestDate: null as Date | null,
                });
            }
            const group = groups.get(key);
            if (!group.client && client) {
                group.client = client;
            }
            return group;
        };

        const touchDate = (group: any, value: string | null | undefined) => {
            if (!value) return;
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return;
            if (!group.latestDate || date > group.latestDate) {
                group.latestDate = date;
            }
        };

        // Добавляем брони
        reservations.forEach((r: PassportReservation | PassportReservationBrief) => {
            const clientId = r.client_id ? Number(r.client_id) : null;
            const group = ensureGroup(clientId, null);
            group.reservations.push(r);
            touchDate(group, r.updated_at || r.created_at || r.start_at);
        });

        // Добавляем сделки
        deals.forEach((d: PassportDeal) => {
            const clientId = d.client_id ? Number(d.client_id) : null;
            const group = ensureGroup(clientId, null);
            group.deals.push(d);
            touchDate(group, d.updated_at || d.created_at || d.contract_date);
        });

        // Создаем мапы для связи платежей с группами
        const dealToGroup = new Map<number, string>();
        const reservationToGroup = new Map<number, string>();
        groups.forEach((group: any) => {
            group.deals.forEach((d: PassportDeal) => dealToGroup.set(Number(d.id), group.key));
            group.reservations.forEach((r: PassportReservation | PassportReservationBrief) =>
                reservationToGroup.set(Number(r.id), group.key),
            );
        });

        // Нормализация entity_type
        const normalizeEntityType = (value: any) => String(value || '').toLowerCase();

        // Добавляем платежи
        payments.forEach((payment: PassportPayment) => {
            const entityType = normalizeEntityType(
                payment.entity_type_code || payment.entity_type_ref?.code || payment.entity_type,
            );
            let groupKey: string | null = null;

            if (entityType === 'salesdeal' || entityType === 'salesdeal') {
                groupKey = dealToGroup.get(Number(payment.entity_id)) || null;
            } else if (entityType === 'salesreservation') {
                groupKey = reservationToGroup.get(Number(payment.entity_id)) || null;
            }

            // Если не нашли через мапы, пробуем по counterparty_id
            if (!groupKey && payment.counterparty_id) {
                groupKey = `client-${Number(payment.counterparty_id)}`;
            }

            if (!groupKey) return;

            const group =
                groups.get(groupKey) || ensureGroup(Number(payment.counterparty_id) || null, null);
            group.payments.push(payment);
            touchDate(group, payment.paid_date || payment.planned_date || payment.created_at);
        });

        // Приоритет статусов
        const statusPriority: Record<string, number> = { buyout: 1, reservation: 2, history: 3 };

        return Array.from(groups.values())
            .map((group: any) => {
                const hasBuyout = group.deals.some((d: PassportDeal) => isSignedDeal(d));
                const hasReservation = group.reservations.some(
                    (r: PassportReservation | PassportReservationBrief) => isActiveReservation(r),
                );
                const status = hasBuyout ? 'buyout' : hasReservation ? 'reservation' : 'history';

                return {
                    ...group,
                    status,
                    statusLabel: hasBuyout ? 'Выкуп' : hasReservation ? 'Бронь' : 'История',
                    reservations: sortRows(group.reservations, ['updated_at', 'created_at']),
                    deals: sortRows(group.deals, ['updated_at', 'created_at']),
                    payments: sortRows(group.payments, ['paid_date', 'planned_date', 'created_at']),
                };
            })
            .sort(
                (a: any, b: any) =>
                    (b.latestDate?.getTime() || 0) - (a.latestDate?.getTime() || 0) ||
                    (statusPriority[a.status] || 9) - (statusPriority[b.status] || 9),
            );
    }, [reservations, deals, payments, isSignedDeal, isActiveReservation]);

    /*******************************************************************************************************************/
    return {
        reservations,
        deals,
        payments,
        paymentSchedules,
        clientHistory,
        getReservationStatusName,
        getDealStatusName,
        isActiveReservation,
        isSignedDeal,
    };
}
