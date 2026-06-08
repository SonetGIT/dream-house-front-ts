import { formatCurrency } from '@/utils/formatCurrency';
import type { SalesOverviewBlock } from '../slices/salesObjOverviewSlice';
import TypeChips from '@/components/ui/TypeChips';
import { formatArea } from '@/utils/formatNumber';
import UnitStat from '@/components/ui/UnitStat';
import UnitBar from '@/components/ui/UnitBar';

export default function ObjectsOverviewBlockTable({ blocks }: { blocks: SalesOverviewBlock[] }) {
    return (
        <div className="overflow-hidden bg-white border rounded-lg shadow-sm">
            <table className="w-full">
                <thead className="text-gray-700 bg-gray-50">
                    <tr className="border-b">
                        <th className="w-12 px-3 py-3 text-sm font-semibold text-left">№</th>
                        <th className="px-3 py-2 text-sm text-left">Блок</th>
                        <th className="px-3 py-2 text-sm text-left">По статусам</th>
                        <th className="px-3 py-2 text-sm text-left">По типам</th>
                        <th className="px-3 py-2 text-sm text-left">Стоимость</th>
                    </tr>
                </thead>

                <tbody>
                    {blocks.map((block) => {
                        return (
                            <tr key={block.id}>
                                <td className="px-2 py-2 text-xs font-medium text-gray-700">
                                    {block.id}
                                </td>
                                <td className="px-2 py-2 text-left align-top border-l">
                                    <div className="flex flex-col gap-2">
                                        {/* Название + Статус в одной строке */}
                                        <div className="flex items-start gap-2">
                                            <span className="flex-1 text-sm font-semibold text-gray-700">
                                                {block.name}
                                            </span>
                                        </div>
                                        {/* Площадь */}
                                        <div className="text-xs text-gray-500">
                                            Общая площадь:{' '}
                                            <span className="text-xs text-sky-600">
                                                {formatArea(block.total_area)}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-2 py-2 text-sm text-center text-gray-900 ">
                                    <div className="flex items-center gap-3 mb-1">
                                        <UnitStat
                                            label="Всего"
                                            count={block.total_units}
                                            color="text-gray-700"
                                        />
                                        <UnitStat
                                            label="Своб"
                                            count={block.free_units}
                                            color="text-emerald-600"
                                        />
                                        <UnitStat
                                            label="Резв"
                                            count={block.reserved_units}
                                            color="text-amber-500"
                                        />
                                        <UnitStat
                                            label="Прод"
                                            count={block.sold_units}
                                            color="text-sky-600"
                                        />
                                        <UnitStat
                                            label="Офф"
                                            count={block.offmarket_units}
                                            color="text-gray-400"
                                        />
                                    </div>
                                    <UnitBar
                                        total={block.total_units}
                                        free={block.free_units}
                                        reserved={block.reserved_units}
                                        sold={block.sold_units}
                                        off={block.offmarket_units}
                                    />
                                </td>
                                <td className="px-2 py-2 text-sm text-center text-gray-900">
                                    <TypeChips
                                        apt={block.apartments}
                                        com={block.commercial_units}
                                        park={block.parking_units}
                                        stor={block.storage_units}
                                    />
                                </td>
                                <td className="px-2 py-2 space-y-0.5">
                                    <div className="text-xs text-gray-600 ">
                                        Своб фонд:{' '}
                                        <span className="text-sm font-medium text-violet-600">
                                            {formatCurrency(block.free_price)}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600 ">
                                        Продано:{' '}
                                        <span className="text-sm font-medium text-sky-600">
                                            {formatCurrency(block.sold_price)}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600 ">
                                        Резерв:{' '}
                                        <span className="text-sm font-medium text-amber-500">
                                            {formatCurrency(block.reserved_price)}
                                        </span>
                                    </div>
                                    <div className="text-xs font-bold text-gray-600 ">
                                        Итого:{' '}
                                        <span className="text-sm font-medium text-emerald-700">
                                            {formatCurrency(block.total_price)}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
