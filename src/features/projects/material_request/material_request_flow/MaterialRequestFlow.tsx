import { useMemo, useState } from 'react';

import type { ReferenceResult } from '@/features/reference/referenceSlice';
import type { ProjectBlock } from '../../pto/projectBlocks/projectBlocksSlice';
import type { EstimateItem } from '../../pto/projectBlocks/estimatess/estimateItems/estimateItemsSlice';

import MaterialReqCreateModal from '../MaterialReqCreateModal';
import MaterialsSelectTable from './MaterialsSelectTable';
import MaterialReqCreateEditForm from './MaterialReqCreateEditForm';
import { useAppSelector } from '@/app/store';

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
    const estimates = useAppSelector((state) => state.estimates.data || []);

    // ---------------- STATE ----------------
    const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
    const [selectedItems, setSelectedItems] = useState<EstimateItem[]>([]);

    // ---------------- FILTER ITEMS BY BLOCK ----------------
    const estimateItems = useMemo(() => {
        if (!selectedBlock) return [];

        return estimates.filter((e) => e.block_id === selectedBlock).flatMap((e) => e.items || []);
    }, [estimates, selectedBlock]);

    // ---------------- RENDER ----------------
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
                    estimates={estimates} // 👈 ВАЖНО
                    onClose={onClose}
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
                <MaterialReqCreateEditForm
                    projectId={projectId}
                    blockId={selectedBlock}
                    initialItems={selectedItems}
                    refs={refs}
                    onCancel={onClose}
                    // onCancel={() => {
                    //     setSelectedBlock(null);
                    //     setSelectedItems([]);
                    //     setStep('select');
                    // }}
                />
            )}
        </div>
    );
}
