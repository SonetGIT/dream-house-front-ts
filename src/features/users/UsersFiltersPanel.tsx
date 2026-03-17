import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { Search, Plus, RotateCcw, Filter } from 'lucide-react';
import { useState } from 'react';

interface FiltersPanelProps {
    refs: Record<string, ReferenceResult>;
    onSearch: (filters: {
        search: string;
        typeId: number | null;
        statusId: number | null;
        customerId: number | null;
    }) => void;
    onReset: () => void;
    onCreate: () => void;
}

/**********************************************************************************************************/
export default function UsersFiltersPanel({
    refs,
    onSearch,
    onReset,
    onCreate,
}: FiltersPanelProps) {
    const [searchText, setSearchText] = useState('');
    const [typeId, setTypeId] = useState<number | null>(null);
    const [statusId, setStatusId] = useState<number | null>(null);
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        onSearch({ search: searchText, typeId, statusId, customerId });
    };

    const handleReset = () => {
        setSearchText('');
        setTypeId(null);
        setStatusId(null);
        setCustomerId(null);
        onReset();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const hasActiveFilters = typeId !== null || statusId !== null || customerId !== null;

    /**************************************************************************************************************************/
    return (
        <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Основная строка */}
            <div className="p-4">
                <div className="flex items-center gap-3">
                    {/* Поиск */}
                    <div className="flex-1 min-w-[300px]">
                        <div className="relative">
                            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Поиск по имени, логину, email..."
                                className="w-full py-2 pl-10 pr-4 text-sm text-gray-900 transition-all bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Кнопки */}
                    <StyledTooltip title="Фильтры">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`
                                flex items-center gap-2 px-4 py-2
                                text-sm font-medium
                                ${
                                    hasActiveFilters
                                        ? 'text-white bg-sky-600 hover:bg-sky-500'
                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                }
                                rounded-lg transition-colors
                                focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
                            `}
                        >
                            <Filter className="w-4 h-4" />
                            {hasActiveFilters && (
                                <span className="px-1.5 py-0.5 text-xs bg-white/20 rounded">
                                    {[typeId, statusId, customerId].filter(Boolean).length}
                                </span>
                            )}
                        </button>
                    </StyledTooltip>

                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:ring-offset-2"
                    >
                        Поиск
                    </button>
                    <StyledTooltip title="Сбросить фильтры">
                        <button
                            onClick={handleReset}
                            className="p-2 text-gray-600 transition-colors rounded-lg hover:text-gray-900 hover:bg-gray-100"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </StyledTooltip>
                    <div className="w-px h-8 bg-gray-300" />

                    <button
                        onClick={onCreate}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 transition-colors border border-gray-300 border-dashed rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:ring-offset-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm"> СОЗДАТЬ</span>
                    </button>
                </div>
            </div>

            {/* Расширенные фильтры */}
            {showFilters && (
                <div
                    className="px-4 pb-4 border-t border-gray-200 bg-gray-50"
                    style={{ animation: 'slideDown 0.2s ease-out' }}
                >
                    <div className="grid grid-cols-3 gap-4 pt-4">
                        {/* Тип проекта */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Тип проекта
                            </label>
                            <select
                                value={typeId || ''}
                                onChange={(e) =>
                                    setTypeId(e.target.value ? Number(e.target.value) : null)
                                }
                                className="w-full px-3 py-2 text-sm text-gray-900 transition-all bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent"
                            >
                                <option value="">Все типы</option>
                                {/* {refs.projectTypes.data?.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))} */}
                            </select>
                        </div>

                        {/* Статус */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Статус
                            </label>
                            <select
                                value={statusId || ''}
                                onChange={(e) =>
                                    setStatusId(e.target.value ? Number(e.target.value) : null)
                                }
                                className="w-full px-3 py-2 text-sm text-gray-900 transition-all bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent"
                            >
                                <option value="">Все статусы</option>
                                {/* {refs.projectStatuses.data?.map((status) => (
                                    <option key={status.id} value={status.id}>
                                        {status.name}
                                    </option>
                                ))} */}
                            </select>
                        </div>

                        {/* Заказчик */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Заказчик
                            </label>
                            <select
                                value={customerId || ''}
                                onChange={(e) =>
                                    setCustomerId(e.target.value ? Number(e.target.value) : null)
                                }
                                className="w-full px-3 py-2 text-sm text-gray-900 transition-all bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent"
                            >
                                <option value="">Все заказчики</option>
                                {/* {refs.projectStatuses.data?.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))} */}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
