import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    clearSalesUnitPassport,
    fetchSalesUnitPassport,
} from '@/features/sales/slices/salesUnitPassportSlice';
import { useReference } from '@/features/reference/useReference';
import SalesUnitPassportHeader from './SalesUnitPassportHeader';
import { SalesUnitPassportHistoryPanel } from './SalesUnitPassportHistoryPanel';

type SalesUnitPassportPageProps = {
    unitId: number;
    onClose?: () => void;
};
export function InlineMetric({
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
/******************************************************************************************************************/
export function SalesUnitPassportPage({ unitId, onClose }: SalesUnitPassportPageProps) {
    const dispatch = useAppDispatch();

    const { unit, clients, reservations, deals, payments, paymentSchedules, loading, error } =
        useAppSelector((state) => state.salesUnitPassport);

    useEffect(() => {
        if (!unitId) return;

        void dispatch(fetchSalesUnitPassport(unitId));

        return () => {
            dispatch(clearSalesUnitPassport());
        };
    }, [dispatch, unitId]);

    const prjName = useReference('projects');
    const blokName = useReference('projectBlocks');
    const refs = { prjName, blokName };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center text-sm text-slate-500">
                Загрузка паспорта квартиры...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">
                {error}
            </div>
        );
    }

    if (!unit) {
        return (
            <div className="p-6 text-sm border border-dashed rounded-xl border-slate-300 text-slate-500">
                Данные по квартире не найдены
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm rounded-2xl">
            <div className="flex items-start justify-between gap-3 ">
                {/* ИНФОРМАЦИЯ О ЛЕТЕ */}
                <SalesUnitPassportHeader unit={unit} refs={refs} onClose={onClose} />
            </div>

            <div className="space-y-3">
                <SalesUnitPassportHistoryPanel clients={clients} />
            </div>
        </div>
    );
}
