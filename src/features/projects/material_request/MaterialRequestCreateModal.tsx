import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { Estimate } from '../pto/projectBlocks/estimatess/estimatesSlice';
import type { ReferenceResult } from '@/features/reference/referenceSlice';

interface MatReqCreateProps {
    blockId: number;
    estimates: Estimate[];
    refs: Record<string, ReferenceResult>;
    loading?: boolean;
    onSubmit: (data: { block_id: number; mode: 'estimate' | 'manual' }) => void;
    onClose: () => void;
}

export default function MaterialRequestCreateModal({
    blockId,
    estimates,
    refs,
    loading = false,
    onSubmit,
    onClose,
}: MatReqCreateProps) {
    const [error, setError] = useState<string | null>(null);
    console.log('blockId', blockId);
    console.log('prjBlocks', refs.prjBlocks);
    //CHECK ESTIMATE
    const hasEstimateItems = useMemo(() => {
        if (!blockId) return false;

        return estimates.some((e) => e.block_id === blockId && (e.items?.length ?? 0) > 0);
    }, [blockId, estimates]);

    //HANDLER
    const handleSelectMode = (mode: 'estimate' | 'manual') => {
        if (mode === 'estimate' && !hasEstimateItems) {
            setError('В этом блоке нет материалов из сметы');
            return;
        }
        setError(null);

        onSubmit({
            block_id: blockId,
            mode,
        });
    };

    /**************************************************************************************************************/
    return (
        <div className="space-y-6">
            {/* Block selection */}
            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Основные параметры заявки
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Блок проекта <span className="text-red-500">*</span>
                        </label>

                        <input
                            type="text"
                            value={
                                blockId
                                    ? refs.prjBlocks.lookup(blockId) || `Блок ID ${blockId}`
                                    : '—'
                            }
                            readOnly
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-green-50
                                border border-green-300 ${error && !blockId ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg cursor-default
                            `}
                        />
                        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                    </div>
                </div>
            </div>

            {/* Mode selection */}
            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Добавление материалов
                </h3>

                <div className="flex gap-3">
                    {/* ИЗ СМЕТЫ */}
                    <button
                        type="button"
                        disabled={!blockId || !hasEstimateItems}
                        onClick={() => handleSelectMode('estimate')}
                        className={`
                            flex items-center justify-center w-full gap-2 px-3 py-2 mt-4 
                            transition-colors bg-white border border-dashed rounded-lg
                            ${
                                !blockId || !hasEstimateItems
                                    ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                    : 'text-red-600 border-pink-300 hover:bg-gray-50'
                            }
                        `}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">ИЗ СМЕТЫ</span>
                    </button>

                    {/* ДОПОЛНИТЕЛЬНО */}
                    <button
                        type="button"
                        disabled={!blockId}
                        onClick={() => handleSelectMode('manual')}
                        className={`
                            flex items-center justify-center w-full gap-2 px-3 py-2 mt-4 
                            transition-colors bg-white border border-dashed rounded-lg
                            ${
                                !blockId
                                    ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                    : 'text-orange-600 border-orange-300 hover:bg-gray-50'
                            }
                        `}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">ДОПОЛНИТЕЛЬНО</span>
                    </button>
                </div>

                {/* Подсказка */}
                {blockId && !hasEstimateItems && (
                    <p className="mt-2 text-xs text-red-500">
                        В выбранном блоке нет материалов из сметы
                    </p>
                )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="
                        w-full px-4 py-2.5
                        text-sm font-medium text-sky-700
                        bg-white border border-blue-300
                        hover:bg-blue-50
                        rounded-lg transition-colors
                    "
                >
                    ОТМЕНА
                </button>
            </div>
        </div>
    );
}
