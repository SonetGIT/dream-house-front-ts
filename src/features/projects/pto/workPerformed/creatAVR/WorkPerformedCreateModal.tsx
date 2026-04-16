import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Estimate } from '../../projectBlocks/estimatess/estimatesSlice';
import { TextField } from '@mui/material';
import { parseNumber } from '@/utils/parseNumber';
import type { ReferenceResult } from '@/features/reference/referenceSlice';

interface WorkPerformedCreateData {
    block_id: number;
    mode: 'estimate' | 'manual';
    performed_person_name: string;
    advance_payment: number | null;
}

interface WorkPerformedCreateProps {
    blockId: number;
    estimates: Estimate[];
    refs: Record<string, ReferenceResult>;
    loading?: boolean;
    onSubmit: (data: WorkPerformedCreateData) => void;
    onClose: () => void;
}

type Errors = Partial<
    Record<'block_id' | 'performed_person_name' | 'advance_payment' | 'mode', string>
>;

export default function WorkPerformedCreateModal({
    blockId,
    estimates,
    refs,
    loading = false,
    onSubmit,
    onClose,
}: WorkPerformedCreateProps) {
    const [performedPersonName, setPerformedPersonName] = useState('');
    const [advancePayment, setAdvancePayment] = useState<number | null>(null);
    const [errors, setErrors] = useState<Errors>({});

    const hasEstimateItems = useMemo(() => {
        if (!blockId) return false;

        return estimates.some((estimate) => {
            return estimate.block_id === blockId && (estimate.items?.length ?? 0) > 0;
        });
    }, [blockId, estimates]);

    const clearError = (field: keyof Errors) => {
        setErrors((prev) => {
            const { [field]: _, ...rest } = prev;
            return rest;
        });
    };

    const validate = (mode: 'estimate' | 'manual') => {
        const nextErrors: Errors = {};

        if (!blockId) {
            nextErrors.block_id = 'Выберите блок';
        }

        if (!performedPersonName.trim()) {
            nextErrors.performed_person_name = 'Введите исполнителя работ';
        }

        if (advancePayment != null && advancePayment < 0) {
            nextErrors.advance_payment = 'Предоплата не может быть меньше 0';
        }

        if (mode === 'estimate' && !hasEstimateItems) {
            nextErrors.mode = 'В этом блоке нет услуг из сметы';
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSelectMode = (mode: 'estimate' | 'manual') => {
        if (!validate(mode) || !blockId) return;

        onSubmit({
            block_id: blockId,
            mode,
            performed_person_name: performedPersonName.trim(),
            advance_payment: advancePayment,
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Основные параметры АВР
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Блок проекта <span className="text-red-500">*</span>
                        </label>

                        <input
                            type="text"
                            value={blockId ? refs.prjBlocks.lookup(blockId) : '—'}
                            readOnly
                            className={`
                                w-full px-3 py-2 text-sm text-gray-900 bg-green-50
                                border border-green-300 ${errors && !blockId ? 'border-red-300' : 'border-gray-300'}
                                rounded-lg cursor-default
                            `}
                        />
                    </div>

                    <div className="col-span-2">
                        <TextField
                            label="Исполнитель работ"
                            value={performedPersonName}
                            onChange={(e) => {
                                setPerformedPersonName(e.target.value);
                                clearError('performed_person_name');
                            }}
                            error={Boolean(errors.performed_person_name)}
                            helperText={errors.performed_person_name}
                            size="small"
                            fullWidth
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="col-span-2">
                        <TextField
                            label="Предоплата"
                            type="text"
                            value={advancePayment ?? ''}
                            onChange={(e) => {
                                setAdvancePayment(
                                    e.target.value ? parseNumber(e.target.value) : null,
                                );
                                clearError('advance_payment');
                            }}
                            error={Boolean(errors.advance_payment)}
                            helperText={errors.advance_payment}
                            size="small"
                            fullWidth
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="pb-2 mb-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Добавление услуг
                </h3>

                <div className="flex gap-3">
                    <button
                        type="button"
                        disabled={loading || !blockId || !hasEstimateItems}
                        onClick={() => handleSelectMode('estimate')}
                        className={`
                            flex items-center justify-center w-full gap-2 px-3 py-2 mt-4 
                            transition-colors bg-white border border-dashed rounded-lg
                            ${
                                loading || !blockId || !hasEstimateItems
                                    ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                    : 'text-red-600 border-pink-300 hover:bg-gray-50'
                            }
                        `}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">УСЛУГИ ИЗ СМЕТЫ</span>
                    </button>

                    <button
                        type="button"
                        disabled={loading || !blockId}
                        onClick={() => handleSelectMode('manual')}
                        className={`
                            flex items-center justify-center w-full gap-2 px-3 py-2 mt-4 
                            transition-colors bg-white border border-dashed rounded-lg
                            ${
                                loading || !blockId
                                    ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                    : 'text-orange-600 border-orange-300 hover:bg-gray-50'
                            }
                        `}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">ДОПОЛНИТЕЛЬНО</span>
                    </button>
                </div>

                {errors.mode && <p className="mt-2 text-xs text-red-500">{errors.mode}</p>}

                {blockId && !hasEstimateItems && (
                    <p className="mt-2 text-xs text-red-500">
                        В выбранном блоке нет услуг из сметы
                    </p>
                )}
            </div>

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
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    ОТМЕНА
                </button>
            </div>
        </div>
    );
}
