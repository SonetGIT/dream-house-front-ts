import { useContext, useEffect, useState } from 'react';
import { Pencil, Plus, CalendarClock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/store';
import {
    fetchSalesUnitPassport,
    selectPassport,
    selectPassportLoading,
    selectPassportUnit,
} from '@/features/sales/slices/salesUnitPassportSlice';
import {
    fetchSalesUnitStatuses,
    fetchSalesDealTypes,
} from '@/features/sales/slices/salesDictionariesSlice';
import { fetchSalesClients } from '@/features/sales/slices/salesClientsSlice';
import { useReference } from '@/features/reference/useReference';
import { useUnitDetailsLogic } from './UnitDetailsLogic';
import { Button } from '@mui/material';
import { ClientAccordionItem } from './ClientAccordionItem';
import {
    InputField,
    ModalWrapper,
    PrimaryButton,
    SecondaryButton,
    SelectField,
} from './ObjectsOverviewUnitsPage';

export default function SalesUnitDetailsPanel({
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
    const currencies = useAppSelector((state: any) => state.dictionaries?.currencies) || [];

    const dealStatuses =
        useAppSelector((state: any) => state.salesDictionaries?.dealStatuses) || [];

    // 1. Вся бизнес-логика вынесена в хук
    const { clientHistory, getReservationStatusName, getDealStatusName, isActiveReservation } =
        useUnitDetailsLogic(passport, /*reservationStatuses,*/ dealStatuses);

    // 2. Локальный UI-стейт
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
            // dispatch(fetchDealStatuses());
        }
    }, [dispatch, unitId]);

    const handleSaveReservation = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // TODO: Замените на ваш thunk, например: await dispatch(createReservation(resForm)).unwrap();
            toast.success('Бронь сохранена');
            setReservationModalOpen(false);
            dispatch(fetchSalesUnitPassport(unitId)); // Обновляем данные
        } catch (err) {
            toast.error('Ошибка сохранения');
        } finally {
            setIsSaving(false);
        }
    };

    if (passportLoading && !passport)
        return (
            <div className="w-[550px] h-full bg-white border-l border-stone-200 flex items-center justify-center">
                <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    if (!passportUnit)
        return (
            <div className="w-[550px] h-full bg-white border-l border-stone-200 flex items-center justify-center text-slate-500">
                Квартира не найдена
            </div>
        );
    // const reservationStatuses1 = useReference('reservationStatuses');
    // const dealPaymentTypes = useReference('dealPaymentTypes');
    return (
        <div className="w-[550px] h-full bg-white border-l border-stone-200 flex flex-col shadow-xl overflow-hidden animate-slide-in-right">
            {/* Шапка */}
            {/* <UnitHeader unit={passportUnit} onClose={onClose} onEdit={() => toast.success('Открыть модалку редактирования')} /> */}

            {/* Контент */}
            <div className="flex-1 p-5 space-y-6 overflow-y-auto">
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                <CalendarClock size={16} className="text-amber-500" /> История
                                клиентов
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Брони, договоры и платежи
                            </p>
                        </div>
                        <Button onClick={() => setReservationModalOpen(true)} className="h-9">
                            <Plus size={14} className="mr-1" /> Бронь
                        </Button>
                    </div>

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
                        <div className="py-8 text-sm text-center border border-dashed text-slate-500 border-stone-300 rounded-xl bg-slate-50">
                            По квартире пока нет клиентов.
                        </div>
                    )}
                </section>
            </div>

            {/* Модалка (пример) */}
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
