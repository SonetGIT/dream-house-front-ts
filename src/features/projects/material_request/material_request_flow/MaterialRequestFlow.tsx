import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';

import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { ProjectBlock } from '../../pto/projectBlocks/projectBlocksSlice';
import {
    fetchEstimateItems,
    type EstimateItem,
} from '../../pto/projectBlocks/estimatess/estimateItems/estimateItemsSlice';

import MaterialReqCreateModal from '../MaterialRequestCreateModal';
import MaterialsSelectTable from './MaterialsItemSelectTable';
import MatReqItemsCreateEditForm from '../../material_request_items/MatReqItemsCreateEditForm';
import { fetchEstimates } from '../../pto/projectBlocks/estimatess/estimatesSlice';

interface MaterialRequestFlowProps {
    step: 'select' | 'estimate' | 'form';
    setStep: React.Dispatch<React.SetStateAction<'select' | 'estimate' | 'form'>>;
    projectId: number;
    blocks: ProjectBlock[];
    refs: Record<string, ReferenceResult>;
    calcRowTotal: (row: any) => number;
    onClose: () => void;
}

export default function MaterialRequestFlow({
    step,
    setStep,
    projectId,
    blocks,
    refs,
    calcRowTotal,
    onClose,
}: MaterialRequestFlowProps) {
    const dispatch = useAppDispatch();
    const { data: estimates, loading } = useAppSelector((state) => state.estimates);

    // STATE
    const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
    const [selectedItems, setSelectedItems] = useState<EstimateItem[]>([]);

    // FILTER ITEMS BY BLOCK
    const estimateItems = useMemo(() => {
        if (!selectedBlock) return [];

        return estimates.filter((e) => e.block_id === selectedBlock).flatMap((e) => e.items || []);
    }, [estimates, selectedBlock]);

    // ✅ загрузка estimates один раз
    useEffect(() => {
        dispatch(
            fetchEstimates({
                block_id: 0,
                page: 1,
                size: 10,
            }),
        );
    }, [dispatch]);

    // ✅ загрузка estimateItems ТОЛЬКО когда выбран блок
    useEffect(() => {
        if (selectedBlock) {
            dispatch(fetchEstimateItems());
        }
    }, [selectedBlock, dispatch]);

    const resetFlow = () => {
        setStep('select');
        setSelectedBlock(null);
        setSelectedItems([]);
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
                <h2 className="text-lg font-semibold text-gray-900">
                    Создание заявки на материалы
                </h2>

                {step !== 'select' && (
                    <button
                        onClick={() => {
                            setSelectedBlock(null);
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
                <MaterialReqCreateModal
                    blocks={blocks}
                    estimates={estimates}
                    onClose={handleClose}
                    onSubmit={({ block_id, mode }) => {
                        setSelectedBlock(block_id);

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
            {step === 'estimate' && selectedBlock && (
                <MaterialsSelectTable
                    items={estimateItems}
                    loading={loading}
                    refs={refs}
                    calcRowTotal={calcRowTotal}
                    projectId={projectId}
                    blockId={selectedBlock}
                    onNext={(items) => {
                        setSelectedItems(items);
                        setStep('form');
                    }}
                />
            )}

            {/* STEP 3 — ЕДИНАЯ ФОРМА */}
            {step === 'form' && selectedBlock && (
                <MatReqItemsCreateEditForm
                    projectId={projectId}
                    blockId={selectedBlock}
                    initialItems={selectedItems}
                    refs={refs}
                    onCancel={handleClose}
                />
            )}
        </div>
    );
}
