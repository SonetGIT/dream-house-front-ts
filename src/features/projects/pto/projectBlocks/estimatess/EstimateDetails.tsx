import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { useReference } from '@/features/reference/useReference';

import type { MaterialEstimate } from './estimatesSlice';
import type { MaterialEstimateItem } from './estimateItems/estimateItemsSlice';

import MaterialsTable from './estimateItems/MaterialsTable';
import ServicesTable from './estimateItems/ServicesTable';
import EstimateHistory from './estimateItems/EstimateHistory';
import MaterialEstimateItemsCreate from './estimateItems/MaterialEstimateItemsCreate';
import ServicesEstimateItemsCreate from './estimateItems/ServicesEstimateItemsCreate';

interface EstimateDetailsProps {
    item: MaterialEstimate;
    items: MaterialEstimateItem[];
    onDeleteEstimateItemId: (id: number) => void;
}

type TabType = 'materials' | 'services' | 'history';

export default function EstimateDetails({
    item,
    items,
    onDeleteEstimateItemId,
}: EstimateDetailsProps) {
    const [tab, setTab] = useState<TabType>('materials');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentRowId, setCurrentRowId] = useState<number | null>(null);

    /** справочники */
    const refs = {
        materials: useReference('materials'),
        materialTypes: useReference('materialTypes'),
        services: useReference('services'),
        serviceTypes: useReference('serviceTypes'),
        unitsOfMeasure: useReference('unitsOfMeasure'),
        currencies: useReference('currencies'),
    };

    /** расчет суммы строки */
    const rowTotal = (row: MaterialEstimateItem) => {
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

    const handleAddMaterial = (rowId: number) => {
        setCurrentRowId(rowId);
        setIsFormOpen(true);
    };

    const handleAddService = (rowId: number) => {
        setCurrentRowId(rowId);
        setIsFormOpen(true);
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
                isOpen={isFormOpen}
                estimateId={currentRowId}
                refs={refs}
                onClose={() => setIsFormOpen(false)}
                // onSubmit={handleFormSubmit}
            />

            <ServicesEstimateItemsCreate
                isOpen={isFormOpen}
                estimateId={currentRowId}
                refs={refs}
                onClose={() => setIsFormOpen(false)}
                // onSubmit={handleFormSubmit}
            />
        </>
    );
}
