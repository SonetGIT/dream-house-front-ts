import type { BlockStage } from './blockStagesSlice';
import BlockStageRow from './BlockStageRow';

interface BlockStagesTableProps {
    stages: BlockStage[];
    onDeleteStageId: (id: number) => void;
    onDeleteSubStageId: (id: number, stageId: number) => void;
}

export default function BlockStagesTable({
    stages,
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
                                <th className="border-b w-9" />

                                {/* Name */}
                                <th className="bg-blue-50 text-blue-600 text-[11px] font-bold tracking-wider uppercase px-3 py-2.5 text-left border-b border-r">
                                    Название этапа
                                </th>

                                {/* Start */}
                                <th className="w-[200px] bg-blue-50 text-blue-600 text-[11px] font-bold tracking-wider uppercase px-3 py-2.5 text-left border-b border-r">
                                    Дата начала
                                </th>

                                {/* End */}
                                <th className="w-[200px] bg-blue-50 text-blue-600 text-[11px] font-bold tracking-wider uppercase px-3 py-2.5 text-left border-b border-r">
                                    Дата окончания
                                </th>

                                {/* Duration — pink accent */}
                                <th className="w-[180px] bg-rose-200 text-rose-700 text-[11px] font-bold tracking-wider uppercase px-3 py-2.5 text-center border-b border-r ">
                                    Продолжительность (дни)
                                </th>

                                {/* Actions */}
                                <th className="w-[72px] bg-gray-50 text-gray-400 text-[11px] font-bold tracking-wider uppercase px-3 py-2.5 text-center border-b ">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {stages.map((stage) => (
                                <BlockStageRow
                                    key={stage.id}
                                    stage={stage}
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
