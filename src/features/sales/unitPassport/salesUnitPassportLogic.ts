import { useMemo } from 'react';
import {
    type PassportClient,
    type PassportReservation,
    type PassportDeal,
    type PassportPayment,
    type UnitPassport,
    type PassportReservationBrief,
} from '../slices/salesUnitPassportSlice copy';
import type { EnumItem } from '@/features/reference/referenceService';

export function useSalesUnitPassportLogic(
    passport: UnitPassport | null,
    reservationStatuses?: EnumItem[],
    dealStatuses?: EnumItem[],
) {
    const passportClients = useMemo(() => passport?.unit?.clients || [], [passport]);
    const passportClientById = useMemo(() => {
        const map = new Map<number, PassportClient>();

        passportClients.forEach((client) => {
            if (client?.id) {
                map.set(Number(client.id), client);
            }
        });

        return map;
    }, [passportClients]);

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

    const getRowTimestamp = (row: Record<string, unknown>, fields: string[]) => {
        for (const field of fields) {
            const value = row?.[field];
            if (!value) continue;
            const timestamp = new Date(String(value)).getTime();
            if (Number.isFinite(timestamp)) return timestamp;
        }
        return 0;
    };

    const sortRowsNewestFirst = (rows: unknown[], fields: string[]) =>
        [...(rows || [])].sort(
            (a, b) =>
                getRowTimestamp(b as Record<string, unknown>, fields) -
                    getRowTimestamp(a as Record<string, unknown>, fields) ||
                Number((b as { id?: number })?.id || 0) - Number((a as { id?: number })?.id || 0),
        );

    const sortPaymentSchedulesOldestFirst = (rows: unknown[]) =>
        [...(rows || [])].sort(
            (a, b) =>
                getRowTimestamp(a as Record<string, unknown>, ['planned_date', 'created_at']) -
                    getRowTimestamp(b as Record<string, unknown>, ['planned_date', 'created_at']) ||
                Number((a as { payment_no?: number })?.payment_no || 0) -
                    Number((b as { payment_no?: number })?.payment_no || 0) ||
                Number((a as { id?: number })?.id || 0) - Number((b as { id?: number })?.id || 0),
        );

    const reservations = useMemo(
        () =>
            sortRowsNewestFirst(
                nestedReservations.length ? nestedReservations : passport?.reservations || [],
                ['updated_at', 'created_at', 'start_at', 'expires_at'],
            ),
        [nestedReservations, passport?.reservations],
    );

    const deals = useMemo(
        () =>
            sortRowsNewestFirst(nestedDeals.length ? nestedDeals : passport?.deals || [], [
                'updated_at',
                'created_at',
                'contract_date',
            ]),
        [nestedDeals, passport?.deals],
    );

    const payments = useMemo(
        () =>
            sortRowsNewestFirst(nestedPayments.length ? nestedPayments : passport?.payments || [], [
                'paid_date',
                'planned_date',
                'created_at',
            ]),
        [nestedPayments, passport?.payments],
    );

    const paymentSchedules = useMemo(
        () =>
            sortPaymentSchedulesOldestFirst(
                nestedPaymentSchedules.length
                    ? nestedPaymentSchedules
                    : passport?.payment_schedules || [],
            ),
        [nestedPaymentSchedules, passport?.payment_schedules],
    );

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

    const statusTextHas = (item: EnumItem | null | undefined, parts: string[]) => {
        const row = item || null;
        const values = [row?.code, row?.name].map((value) => String(value || '').toLowerCase());

        return parts.some((part) => values.some((value) => value.includes(part)));
    };

    const getReservationStatusRow = (
        value: PassportReservation | PassportReservationBrief | number | null | undefined,
    ) => {
        const rawStatus = typeof value === 'object' ? value?.status : value;
        const id = Number(rawStatus);

        return (
            (typeof value === 'object'
                ? 'status_ref' in value
                    ? value.status_ref
                    : null
                : null) ||
            reservationStatusMap.get(id) ||
            null
        );
    };

    const getDealStatusRow = (value: PassportDeal | number | null | undefined) => {
        const rawStatus = typeof value === 'object' ? value?.status : value;
        const id = Number(rawStatus);

        return (
            (typeof value === 'object' ? value?.status_ref : null) || dealStatusMap.get(id) || null
        );
    };

    const getReservationStatusName = (
        value: PassportReservation | PassportReservationBrief | number | null | undefined,
    ) => {
        return getReservationStatusRow(value)?.name || 'Бронь';
    };

    const getDealStatusName = (value: PassportDeal | number | null | undefined) =>
        getDealStatusRow(value)?.name || 'Договор';

    const getReservationStatusKey = (
        value: PassportReservation | PassportReservationBrief | number | null | undefined,
    ) => {
        const row = getReservationStatusRow(value);
        const rawStatus = typeof value === 'object' ? value?.status : value;
        const id = Number(rawStatus);
        const rawText = String(rawStatus || '').toLowerCase();

        if (statusTextHas(row, ['active', 'актив']) || rawText.includes('active') || id === 1) {
            return 'active';
        }
        if (
            statusTextHas(row, ['closed', 'закры', 'подпис']) ||
            rawText.includes('closed') ||
            rawText.includes('закры') ||
            id === 2
        ) {
            return 'closed';
        }
        if (
            statusTextHas(row, ['canceled', 'cancel', 'отмен', 'снят']) ||
            rawText.includes('cancel') ||
            rawText.includes('отмен') ||
            id === 3
        ) {
            return 'canceled';
        }

        return '';
    };

    const getDealStatusKey = (value: PassportDeal | number | null | undefined) => {
        const row = getDealStatusRow(value);
        const rawStatus = typeof value === 'object' ? value?.status : value;
        const id = Number(rawStatus);

        if (statusTextHas(row, ['draft', 'чернов']) || id === 1) return 'draft';
        if (statusTextHas(row, ['active', 'актив']) || id === 2) return 'active';
        if (statusTextHas(row, ['signed', 'подпис']) || id === 3) return 'signed';
        if (statusTextHas(row, ['closed', 'закры']) || id === 4) return 'closed';
        if (statusTextHas(row, ['canceled', 'cancel', 'отмен']) || id === 5) return 'canceled';

        return '';
    };

    const isActiveReservation = (reservation: PassportReservation | PassportReservationBrief) =>
        getReservationStatusKey(reservation) === 'active';

    const isSignedDeal = (deal: PassportDeal) =>
        ['active', 'signed', 'closed'].includes(getDealStatusKey(deal));

    const clientHistory = useMemo(() => {
        const groups = new Map<string, any>();

        const ensureGroup = (clientId: number | null, client: PassportClient | null = null) => {
            const key = clientId ? `client-${clientId}` : 'client-empty';
            const passportClient = clientId
                ? passportClientById.get(Number(clientId)) || null
                : null;

            if (!groups.has(key)) {
                groups.set(key, {
                    key,
                    client_id: clientId,
                    client: client || passportClient,
                    reservations: [] as (PassportReservation | PassportReservationBrief)[],
                    deals: [] as PassportDeal[],
                    payments: [] as PassportPayment[],
                    dealCreatedDate: null as Date | null,
                    createdDate: null as Date | null,
                    latestDate: null as Date | null,
                });
            }
            const group = groups.get(key);
            if (!group.client && (client || passportClient)) {
                group.client = client || passportClient;
            }
            return group;
        };

        const touchCreatedDate = (group: any, value: string | null | undefined) => {
            if (!value) return;
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return;
            if (!group.createdDate || date > group.createdDate) {
                group.createdDate = date;
            }
        };

        const touchDealCreatedDate = (group: any, value: string | null | undefined) => {
            if (!value) return;
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return;
            if (!group.dealCreatedDate || date > group.dealCreatedDate) {
                group.dealCreatedDate = date;
            }
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
            touchCreatedDate(group, r.created_at || r.start_at);
            touchDate(group, r.updated_at || r.created_at || r.start_at);
        });

        // Добавляем сделки
        deals.forEach((d: PassportDeal) => {
            const clientId = d.client_id ? Number(d.client_id) : null;
            const group = ensureGroup(clientId, null);
            group.deals.push(d);
            touchCreatedDate(group, d.created_at || d.contract_date);
            touchDealCreatedDate(group, d.created_at || d.contract_date);
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

        return Array.from(groups.values())
            .map((group: any) => {
                const hasCurrentDeal = group.deals.some(
                    (d: PassportDeal) => getDealStatusKey(d) !== 'canceled',
                );
                const hasReservation = group.reservations.some(
                    (r: PassportReservation | PassportReservationBrief) => isActiveReservation(r),
                );
                const status = hasCurrentDeal
                    ? 'current'
                    : hasReservation
                      ? 'reservation'
                      : 'history';

                return {
                    ...group,
                    status,
                    statusLabel: hasCurrentDeal ? 'Текущий' : hasReservation ? 'Бронь' : 'История',
                    reservations: sortRowsNewestFirst(group.reservations, [
                        'updated_at',
                        'created_at',
                        'start_at',
                        'expires_at',
                    ]),
                    deals: sortRowsNewestFirst(group.deals, [
                        'updated_at',
                        'created_at',
                        'contract_date',
                    ]),
                    payments: sortRowsNewestFirst(group.payments, [
                        'paid_date',
                        'planned_date',
                        'created_at',
                    ]),
                };
            })
            .sort(
                (a: any, b: any) =>
                    (b.dealCreatedDate ? 1 : 0) - (a.dealCreatedDate ? 1 : 0) ||
                    (b.dealCreatedDate?.getTime() || 0) - (a.dealCreatedDate?.getTime() || 0) ||
                    (b.createdDate?.getTime() || 0) - (a.createdDate?.getTime() || 0) ||
                    (b.latestDate?.getTime() || 0) - (a.latestDate?.getTime() || 0),
            );
    }, [reservations, deals, payments, isActiveReservation, passportClientById]);

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
        getDealStatusKey,
    };
}
