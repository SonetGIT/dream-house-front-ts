import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import { useReference } from '@/features/reference/useReference';

import ServicesTable from './estimateItems/ServicesTable';
import EstimateHistory from './estimateItems/EstimateHistory';
import MaterialEstimateItemsCreate from './estimateItems/MaterialEstimateItemsCreate';
import ServicesEstimateItemsCreate from './estimateItems/ServicesEstimateItemsCreate';
import type { Estimate } from './estimatesSlice';
import {
    fetchEstimateItems,
    updateEstimateItem,
    type EstimateItem,
} from './estimateItems/estimateItemsSlice';
import { useAppDispatch } from '@/app/store';
import toast from 'react-hot-toast';
import MaterialsTable from './estimateItems/MaterialsTable';
import { calcRowTotal } from '@/utils/calcRowTotal';

interface EstimateDetailsProps {
    blockId: number;
    item: Estimate;
    items: EstimateItem[];
    onDeleteEstimateItemId: (id: number) => void;
}

type TabType = 'materials' | 'services' | 'history';

/****************************************************************************************************************/
export default function EstimateDetails({
    blockId,
    item,
    items,
    onDeleteEstimateItemId,
}: EstimateDetailsProps) {
    const dispatch = useAppDispatch();
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
        materialRequestItemTypes: useReference('materialRequestItemTypes'),
    };

    const handleAddMaterial = (rowId: number) => {
        setCurrentRowId(rowId);
        setFormType('material');
    };

    const handleAddService = (rowId: number) => {
        setCurrentRowId(rowId);
        setFormType('service');
    };

    const handleUpdateEstimateItem = async (id: number, data: Partial<EstimateItem>) => {
        try {
            await dispatch(updateEstimateItem({ id, data })).unwrap();
            dispatch(fetchEstimateItems());
            toast.success('Материал обновлен');
        } catch {
            toast.error('Ошибка обновления');
        }
    };

    /*********************************************************************************************************************/
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

                            {/* <button
                                onClick={() => setTab('history')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    tab === 'history'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                История изменений
                            </button> */}
                        </div>

                        {/* MATERIALS */}
                        {tab === 'materials' && (
                            <div>
                                <div className="flex justify-end mb-1">
                                    <StyledTooltip title="Добавить материал">
                                        <button
                                            className="inline-flex items-center justify-center w-8 h-8 text-blue-600 transition-all duration-200 rounded-md bg-blue-50 hover:bg-blue-600 hover:text-white hover:shadow-md active:scale-95"
                                            onClick={() => handleAddMaterial(item.id)}
                                        >
                                            <PlusCircle className="w-6 h-6" />
                                        </button>
                                    </StyledTooltip>
                                </div>

                                <MaterialsTable
                                    items={items}
                                    refs={refs}
                                    calcRowTotal={calcRowTotal}
                                    onDeleteEstimateItemId={onDeleteEstimateItemId}
                                    onUpdateEstimateItem={handleUpdateEstimateItem}
                                />
                            </div>
                        )}

                        {/* SERVICES */}
                        {tab === 'services' && (
                            <div>
                                <div className="flex justify-end mb-1">
                                    <StyledTooltip title="Добавить услугу">
                                        <button
                                            className="inline-flex items-center justify-center w-8 h-8 text-blue-600 transition-all duration-200 rounded-md bg-blue-50 hover:bg-blue-600 hover:text-white hover:shadow-md active:scale-95"
                                            onClick={() => handleAddService(item.id)}
                                        >
                                            <PlusCircle className="w-6 h-6" />
                                        </button>
                                    </StyledTooltip>
                                </div>

                                <ServicesTable
                                    items={items}
                                    refs={refs}
                                    calcRowTotal={calcRowTotal}
                                    onDeleteEstimateItemId={onDeleteEstimateItemId}
                                    onUpdateEstimateItem={handleUpdateEstimateItem}
                                />
                            </div>
                        )}

                        {/* HISTORY */}
                        {tab === 'history' && <EstimateHistory />}
                    </div>
                </td>
            </tr>
            <MaterialEstimateItemsCreate
                blockId={blockId}
                isOpen={formType === 'material'}
                estimateId={currentRowId}
                refs={refs}
                onClose={() => setFormType(null)}
            />

            <ServicesEstimateItemsCreate
                blockId={blockId}
                isOpen={formType === 'service'}
                estimateId={currentRowId}
                refs={refs}
                onClose={() => setFormType(null)}
            />
        </>
    );
}
