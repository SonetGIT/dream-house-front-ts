import { Upload } from 'lucide-react';
import type {
    SalesOverviewBlock,
    SalesOverviewFloor,
    SalesOverviewProject,
} from '@/features/sales/slices/salesObjOverviewSlice';
import { inputCls, labelCls } from '../objectsOverviewUnits/ObjectsOverviewUnitsFilters';

interface Props {
    projects: SalesOverviewProject[];
    blocks: SalesOverviewBlock[];
    floors: SalesOverviewFloor[];
    selectedProjectId: number | null;
    selectedBlockId: number | null;
    selectedFloorId: number | null;
    onProjectChange: (value: number | null) => void;
    onBlockChange: (value: number | null) => void;
    onFloorChange: (value: number | null) => void;
    onOpenPlanManager: () => void;
    planLoading: boolean;
    planDisabled: boolean;
}

export default function SalesMatrixHeader({
    projects,
    blocks,
    floors,
    selectedProjectId,
    selectedBlockId,
    selectedFloorId,
    onProjectChange,
    onBlockChange,
    onFloorChange,
    onOpenPlanManager,
    planLoading,
    planDisabled,
}: Props) {
    return (
        <header className="p-1 mb-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-4 gap-3">
                <div>
                    <label className={labelCls}>Объекты</label>
                    <select
                        value={selectedProjectId ?? ''}
                        onChange={(event) =>
                            onProjectChange(event.target.value ? Number(event.target.value) : null)
                        }
                        className={inputCls}
                    >
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={labelCls}>Блоки</label>
                    <select
                        value={selectedBlockId ?? ''}
                        onChange={(event) =>
                            onBlockChange(event.target.value ? Number(event.target.value) : null)
                        }
                        className={inputCls}
                        disabled={!blocks.length}
                    >
                        {blocks.map((block) => (
                            <option key={block.id} value={block.id}>
                                {block.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={labelCls}>Этажи</label>
                    <select
                        value={selectedFloorId ?? ''}
                        onChange={(event) =>
                            onFloorChange(event.target.value ? Number(event.target.value) : null)
                        }
                        className={inputCls}
                        disabled={!floors.length}
                    >
                        {floors.map((floor) => (
                            <option key={floor.id} value={floor.id}>
                                {floor.name || `${floor.floor_number} этаж`}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <button
                        onClick={onOpenPlanManager}
                        disabled={planDisabled || planLoading}
                        className="flex items-center gap-1.5 mt-5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                    >
                        <Upload size={14} />
                        {planLoading ? 'Загрузка...' : 'SVG-план'}
                    </button>
                </div>
            </div>
        </header>
    );
}
