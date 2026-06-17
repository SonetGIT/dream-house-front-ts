import { useMemo } from 'react';
import {
    type PassportClient,
    type PassportReservation,
    type PassportDeal,
    type PassportPayment,
    type PassportPaymentSchedule,
    type UnitPassport,
    type PassportReservationBrief,
} from '../slices/salesUnitPassportSlice';
import type { EnumItem } from '@/features/reference/referenceService';

export function useUnitDetailsLogic(
    passport: UnitPassport | null,
    reservationStatuses?: EnumItem[],
    dealStatuses?: any[],
) {
    const passportClients = useMemo(() => passport?.unit?.clients || [], [passport]);

    const nestedReservations = useMemo(
        () => passportClients.flatMap((c: PassportClient) => c.reservations || []),
        [passportClients],
    );
    const nestedDeals = useMemo(
        () => passportClients.flatMap((c: PassportClient) => c.deals || []),
        [passportClients],
    );
    const nestedPayments = useMemo(
        () =>
            passportClients.flatMap((c: PassportClient) => [
                ...(c.reservations || []).flatMap((r: any) => r.payments || []),
                ...(c.deals || []).flatMap((d: any) => d.payments || []),
            ]),
        [passportClients],
    );
    const nestedPaymentSchedules = useMemo(
        () => passportClients.flatMap((c: PassportClient) => c.payment_schedules || []),
        [passportClients],
    );

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

    const reservationStatusMap = useMemo(() => {
        const m = new Map();
        reservationStatuses?.forEach((i: any) => m.set(Number(i.id), i));
        return m;
    }, [reservationStatuses]);
    const dealStatusMap = useMemo(() => {
        const m = new Map();
        dealStatuses?.forEach((i: any) => m.set(Number(i.id), i));
        return m;
    }, [dealStatuses]);

    const getReservationStatusName = (value: any) => {
        const id = Number(typeof value === 'object' ? value?.status : value);
        return (
            (typeof value === 'object' ? value?.status_ref : null)?.name ||
            reservationStatusMap.get(id)?.name ||
            'Бронь'
        );
    };

    const getDealStatusName = (value: any) => {
        const id = Number(typeof value === 'object' ? value?.status : value);
        return (
            (typeof value === 'object' ? value?.status_ref : null)?.name ||
            dealStatusMap.get(id)?.name ||
            'Договор'
        );
    };

    const isActiveReservation = (r: any) => {
        const row =
            typeof r === 'object' ? r.status_ref : reservationStatusMap.get(Number(r.status));
        const code = String(row?.code || '').toLowerCase();
        const name = String(row?.name || '').toLowerCase();
        return code === 'active' || name.includes('актив') || Number(r.status) === 1;
    };

    const isSignedDeal = (d: any) => {
        const row = typeof d === 'object' ? d.status_ref : dealStatusMap.get(Number(d.status));
        const code = String(row?.code || '').toLowerCase();
        return (
            ['active', 'signed', 'closed'].includes(code) || [2, 3, 4].includes(Number(d.status))
        );
    };

    const clientHistory = useMemo(() => {
        const groups = new Map();
        const ensureGroup = (clientId: number | null, client: any = null) => {
            const key = clientId ? `client-${clientId}` : 'client-empty';
            if (!groups.has(key))
                groups.set(key, {
                    key,
                    client_id: clientId,
                    client,
                    reservations: [],
                    deals: [],
                    payments: [],
                    latestDate: null,
                });
            return groups.get(key);
        };

        reservations.forEach((r: any) => {
            const g = ensureGroup(r.client_id, r.client);
            g.reservations.push(r);
            const d = new Date(r.updated_at || r.created_at || r.start_at);
            if (!g.latestDate || d > g.latestDate) g.latestDate = d;
        });

        deals.forEach((d: any) => {
            const g = ensureGroup(d.client_id, d.client);
            g.deals.push(d);
            const date = new Date(d.updated_at || d.created_at || d.contract_date);
            if (!g.latestDate || date > g.latestDate) g.latestDate = date;
        });

        const statusPriority: Record<string, number> = { buyout: 1, reservation: 2, history: 3 };
        return Array.from(groups.values())
            .map((g: any) => {
                const hasBuyout = g.deals.some(isSignedDeal);
                const hasReservation = g.reservations.some(isActiveReservation);
                return {
                    ...g,
                    status: hasBuyout ? 'buyout' : hasReservation ? 'reservation' : 'history',
                    statusLabel: hasBuyout ? 'Выкуп' : hasReservation ? 'Бронь' : 'История',
                    reservations: sortRows(g.reservations, ['updated_at', 'created_at']),
                    deals: sortRows(g.deals, ['updated_at', 'created_at']),
                };
            })
            .sort(
                (a: any, b: any) =>
                    (b.latestDate?.getTime() || 0) - (a.latestDate?.getTime() || 0) ||
                    (statusPriority[a.status] || 9) - (statusPriority[b.status] || 9),
            );
    }, [reservations, deals, payments, isSignedDeal, isActiveReservation]);

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
