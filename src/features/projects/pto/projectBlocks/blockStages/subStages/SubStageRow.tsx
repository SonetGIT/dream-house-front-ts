import { Pencil, Trash2 } from 'lucide-react';
import type { StageSubsection } from './stageSubsectionsSlice';

interface Props {
    sub: StageSubsection;
    index: number;
}

export default function SubStageRow({ sub, index }: Props) {
    return (
        <tr className="border-b group last:border-none hover:bg-gray-50">
            <td className="px-4 py-2 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                    {/* точка этапа */}

                    <div className="w-2 h-2 rounded-full bg-sky-500" />

                    <span className="w-6 text-gray-400">{index}.</span>

                    <span className="flex-1">{sub.name}</span>

                    {/* действия */}

                    <div className="flex items-center gap-1 transition opacity-0 group-hover:opacity-100">
                        <button className="p-1 text-gray-400 hover:text-sky-600">
                            <Pencil className="w-3 h-3" />
                        </button>

                        <button className="p-1 text-gray-400 hover:text-red-600">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    );
}
