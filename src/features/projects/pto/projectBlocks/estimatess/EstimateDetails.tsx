import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { useReference } from '@/features/reference/useReference';

import MaterialsTable from './estimateItems/MaterialsTable';
import ServicesTable from './estimateItems/ServicesTable';
import EstimateHistory from './estimateItems/EstimateHistory';
import MaterialEstimateItemsCreate from './estimateItems/MaterialEstimateItemsCreate';
import ServicesEstimateItemsCreate from './estimateItems/ServicesEstimateItemsCreate';
import type { Estimate } from './estimatesSlice';
import type { EstimateItem } from './estimateItems/estimateItemsSlice';

interface EstimateDetailsProps {
    item: Estimate;
    items: EstimateItem[];
    onDeleteEstimateItemId: (id: number) => void;
    onMaterialSumChange: (estimateId: number, newSum: number) => void;
    onServiceSumChange: (estimateId: number, newSum: number) => void;
}

type TabType = 'materials' | 'services' | 'history';

export default function EstimateDetails({
    item,
    items,
    onDeleteEstimateItemId,
    onMaterialSumChange,
    onServiceSumChange,
}: EstimateDetailsProps) {
    const [tab, setTab] = useState<TabType>('materials');
    const [currentRowId, setCurrentRowId] = useState<number>(item.id);
    const [formType, setFormType] = useState<'material' | 'service' | null>(null);

    /** справочники */
    const refs = {
        materials: useReference('materials'),
        materialTypes: useReference('materialTypes'),
        services: useReference('services'),
        serviceTypes: useReference('serviceTypes'),
        unitsOfMeasure: useReference('unitsOfMeasure'),
        currencies: useReference('currencies'),
        blockStages: useReference('blockStages'),
        stageSubsections: useReference('stageSubsections'),
    };

    /** расчет суммы строки */
    const rowTotal = (row: EstimateItem) => {
        const qty = Number(row.quantity_planned) || 0;
        const price = Number(row.price) || 0;

        const coef =
            row.coefficient === undefined || row.coefficient === null || row.coefficient === 1
                ? 1
                : Number(row.coefficient);

        return qty * price * coef;
    };
    // const calculateTotal = () => {
    //     return data.reduce((sum, item) => sum + item.total_price, 0);
    // };
    //  const sum = useMemo(() => {
    //         return rows.reduce((s, r) => s + r.quantity_planned * r.price * (r.currency_rate || 1), 0);
    //     }, [rows]);
    useEffect(() => {
        onMaterialSumChange(estimateId, rowTotal);
    }, [rowTotal]);

    const handleAddMaterial = (rowId: number) => {
        setCurrentRowId(rowId);
        setFormType('material');
    };

    const handleAddService = (rowId: number) => {
        setCurrentRowId(rowId);
        setFormType('service');
    };

    return (
        <>
            <tr className="border-b bg-gradient-to-r from-blue-50 to-blue-50/50">
                <td colSpan={12} className="px-4 py-6">
                    <div className="ml-8">
                        {/* Tabs */}
                        <div className="flex gap-2 mb-4 border-b">
                            <button
                                onClick={() => setTab('materials')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    tab === 'materials'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Материалы
                            </button>

                            <button
                                onClick={() => setTab('services')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    tab === 'services'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Услуги
                            </button>

                            <button
                                onClick={() => setTab('history')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    tab === 'history'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                История изменений
                            </button>
                        </div>

                        {/* MATERIALS */}
                        {tab === 'materials' && (
                            <div>
                                <div className="flex justify-end">
                                    <StyledTooltip title="Добавить материал">
                                        <button
                                            className="
                                        group
                                        p-1.5
                                        text-orange-500
                                        rounded-lg
                                        hover:bg-orange-600
                                        transition-all
                                        duration-300
                                        hover:text-white
                                        hover:scale-110
                                        hover:shadow-xl
                                        hover:-translate-y-1
                                        active:scale-95
                                        "
                                            onClick={() => handleAddMaterial(item.id)}
                                        >
                                            <PlusCircle className="w-6 h-6 transition-transform duration-500 group-hover:rotate-90" />
                                        </button>
                                    </StyledTooltip>
                                </div>

                                <MaterialsTable
                                    items={items}
                                    refs={refs}
                                    rowTotal={rowTotal}
                                    onDeleteEstimateItemId={onDeleteEstimateItemId}
                                />
                            </div>
                        )}

                        {/* SERVICES */}
                        {tab === 'services' && (
                            <div>
                                <div className="flex justify-end">
                                    <StyledTooltip title="Добавить услугу">
                                        <button
                                            className="
                                        group
                                        p-1.5
                                        text-orange-500
                                        rounded-lg
                                        hover:bg-orange-600
                                        transition-all
                                        duration-300
                                        hover:text-white
                                        hover:scale-110
                                        hover:shadow-xl
                                        hover:-translate-y-1
                                        active:scale-95
                                        "
                                            onClick={() => handleAddService(item.id)}
                                        >
                                            <PlusCircle className="w-6 h-6 transition-transform duration-500 group-hover:rotate-90" />
                                        </button>
                                    </StyledTooltip>
                                </div>

                                <ServicesTable
                                    items={items}
                                    refs={refs}
                                    rowTotal={rowTotal}
                                    onDeleteEstimateItemId={onDeleteEstimateItemId}
                                />
                            </div>
                        )}

                        {/* HISTORY */}
                        {tab === 'history' && <EstimateHistory />}
                    </div>
                </td>
            </tr>
            <MaterialEstimateItemsCreate
                isOpen={formType === 'material'}
                estimateId={currentRowId}
                refs={refs}
                onClose={() => setFormType(null)}
                // onSumChange={onMaterialSumChange}
            />

            <ServicesEstimateItemsCreate
                isOpen={formType === 'service'}
                estimateId={currentRowId}
                refs={refs}
                onClose={() => setFormType(null)}
            />
        </>
    );
}
