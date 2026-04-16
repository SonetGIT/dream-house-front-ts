import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';

import type { ReferenceResult } from '@/features/reference/referenceSlice';
import {
    fetchEstimateItems,
    type EstimateItem,
} from '../../projectBlocks/estimatess/estimateItems/estimateItemsSlice';

import { fetchEstimates } from '../../projectBlocks/estimatess/estimatesSlice';
import WorkPerformedCreateModal from './WorkPerformedCreateModal';
import WorkPerformedItemSelectTable from './WorkPerformedItemSelectTable';
import WorkPerformedItemCreateEditForm from './WorkPerformedItemCreateEditForm';

type WorkPerformedMeta = {
    performed_person_name: string;
    advance_payment: number | null;
};

interface WorkPerformedFlowProps {
    step: 'select' | 'estimate' | 'form';
    setStep: React.Dispatch<React.SetStateAction<'select' | 'estimate' | 'form'>>;
    projectId: number;
    blockId: number;
    refs: Record<string, ReferenceResult>;
    calcRowTotal: (row: any) => number;
    onClose: () => void;
}

export default function WorkPerformedFlow({
    step,
    setStep,
    projectId,
    blockId,
    refs,
    calcRowTotal,
    onClose,
}: WorkPerformedFlowProps) {
    const dispatch = useAppDispatch();
    const { data: estimates, loading } = useAppSelector((state) => state.estimates);
    console.log();
    // STATE
    const [workPerformedMeta, setWorkPerformedMeta] = useState<WorkPerformedMeta>({
        performed_person_name: '',
        advance_payment: null,
    });

    const [selectedItems, setSelectedItems] = useState<EstimateItem[]>([]);

    // FILTER ITEMS BY BLOCK
    const estimateItems = useMemo(() => {
        if (!blockId) return [];

        return estimates.filter((e) => e.block_id === blockId).flatMap((e) => e.items || []);
    }, [estimates, blockId]);
    //загрузка estimates один раз
    useEffect(() => {
        dispatch(
            fetchEstimates({
                block_id: 0,
                page: 1,
                size: 10,
            }),
        );
    }, [dispatch]);

    //загрузка estimateItems ТОЛЬКО когда выбран блок
    useEffect(() => {
        if (blockId) {
            dispatch(fetchEstimateItems());
        }
    }, [blockId, dispatch]);

    const resetFlow = () => {
        setStep('select');
        setSelectedItems([]);
        setWorkPerformedMeta({
            performed_person_name: '',
            advance_payment: null,
        });
    };

    const handleClose = () => {
        resetFlow();
        onClose();
    };

    // RENDER
    return (
        <div className="w-full">
            {/* HEADER */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Создание АВР</h2>

                {step !== 'select' && (
                    <button
                        onClick={() => {
                            setSelectedItems([]);
                            setStep('select');
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Назад
                    </button>
                )}
            </div>

            {/* STEP 1 */}
            {step === 'select' && (
                <WorkPerformedCreateModal
                    blockId={blockId}
                    estimates={estimates}
                    refs={refs}
                    onClose={handleClose}
                    onSubmit={({ mode, performed_person_name, advance_payment }) => {
                        setWorkPerformedMeta({
                            performed_person_name,
                            advance_payment,
                        });

                        if (mode === 'estimate') {
                            setStep('estimate');
                        } else {
                            setSelectedItems([]);
                            setStep('form');
                        }
                    }}
                />
            )}

            {/* STEP 2 — выбор из сметы */}
            {step === 'estimate' && blockId && (
                <WorkPerformedItemSelectTable
                    items={estimateItems}
                    loading={loading}
                    refs={refs}
                    calcRowTotal={calcRowTotal}
                    projectId={projectId}
                    blockId={blockId}
                    onNext={(items) => {
                        setSelectedItems(items);
                        setStep('form');
                    }}
                />
            )}

            {/* STEP 3 — ЕДИНАЯ ФОРМА */}
            {step === 'form' && blockId && (
                <WorkPerformedItemCreateEditForm
                    projectId={projectId}
                    blockId={blockId}
                    initialItems={selectedItems}
                    refs={refs}
                    performedPersonName={workPerformedMeta.performed_person_name}
                    advancePayment={workPerformedMeta.advance_payment}
                    onCancel={handleClose}
                />
            )}
        </div>
    );
}
