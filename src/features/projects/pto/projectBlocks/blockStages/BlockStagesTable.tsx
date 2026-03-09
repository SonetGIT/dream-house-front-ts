import type { BlockStage } from './blockStagesSlice';
import BlockStageRow from './BlockStageRow';

interface BlockStagesTableProps {
    stages: BlockStage[];
    onEditStage: (stage: BlockStage) => void;
    onDeleteStageId: (id: number) => void;
    onDeleteSubStageId: (id: number, stageId: number) => void;
}

export default function BlockStagesTable({
    stages,
    onEditStage,
    onDeleteStageId,
    onDeleteSubStageId,
}: BlockStagesTableProps) {
    return (
        <div className="space-y-4">
            {/* Table - BLOCK STAGES */}
            <div className="overflow-hidden bg-white border rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* BLOCK STAGES - HEADER */}
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr className="border-b">
                                {/* Chevron col */}
                                <th className="w-12 px-4 py-3 bg-gray-50"></th>

                                {/* Name */}
                                <th className="px-4 py-3 text-left border-l bg-gray-50">
                                    <div className="text-xs text-blue-700 uppercase">
                                        Название этапа
                                    </div>
                                </th>

                                {/* Start */}
                                <th className="px-4 py-3 text-left border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Дата начала
                                    </div>
                                </th>

                                {/* End */}
                                <th className="px-4 py-3 text-left border-l bg-blue-50">
                                    <div className="text-xs font-semibold text-blue-700 uppercase">
                                        Дата окончания
                                    </div>
                                </th>

                                {/* Duration */}
                                <th className="px-4 py-3 text-center border-l bg-rose-200">
                                    <div className="text-xs font-semibold uppercase text-rose-700">
                                        Продолжительность (дни)
                                    </div>
                                </th>

                                {/* Actions */}
                                <th className="w-24 px-4 py-3 text-center border-l bg-gray-50">
                                    <div className="text-xs text-gray-600 uppercase">Действия</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {stages.map((stage) => (
                                <BlockStageRow
                                    key={stage.id}
                                    stage={stage}
                                    onEditStage={onEditStage}
                                    onDeleteStageId={onDeleteStageId}
                                    onDeleteSubStageId={onDeleteSubStageId}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
