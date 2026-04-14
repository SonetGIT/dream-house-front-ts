import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';

import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { ProjectBlock } from '../../projectBlocks/projectBlocksSlice';
import {
    fetchEstimateItems,
    type EstimateItem,
} from '../../projectBlocks/estimatess/estimateItems/estimateItemsSlice';

import MatReqItemsCreateEditForm from '../../../material_request_items/MatReqItemsCreateEditForm';
import { fetchEstimates } from '../../projectBlocks/estimatess/estimatesSlice';
import WorkPerformedCreateModal from './WorkPerformedCreateModal';
import WorkPerformedItemSelectTable from './WorkPerformedItemSelectTable';
import WorkPerformedItemCreateEditForm from './WorkPerformedItemCreateEditForm';

interface WorkPerformedFlowProps {
    step: 'select' | 'estimate' | 'form';
    setStep: React.Dispatch<React.SetStateAction<'select' | 'estimate' | 'form'>>;
    projectId: number;
    blocks: ProjectBlock[];
    refs: Record<string, ReferenceResult>;
    calcRowTotal: (row: any) => number;
    onClose: () => void;
}

export default function WorkPerformedFlow({
    step,
    setStep,
    projectId,
    blocks,
    refs,
    calcRowTotal,
    onClose,
}: WorkPerformedFlowProps) {
    const dispatch = useAppDispatch();
    const { data: estimates, loading } = useAppSelector((state) => state.estimates);
    console.log();
    // STATE
    const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
    const [selectedItems, setSelectedItems] = useState<EstimateItem[]>([]);

    // FILTER ITEMS BY BLOCK
    const estimateItems = useMemo(() => {
        if (!selectedBlock) return [];

        return estimates.filter((e) => e.block_id === selectedBlock).flatMap((e) => e.items || []);
    }, [estimates, selectedBlock]);
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
                <h2 className="text-lg font-semibold text-gray-900">Создание АВР</h2>

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
                <WorkPerformedCreateModal
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
                <WorkPerformedItemSelectTable
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
                <WorkPerformedItemCreateEditForm
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
