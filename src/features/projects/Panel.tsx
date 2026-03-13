import InputSearch from '@/components/ui/InputSearch';
import { ReferenceSelect } from '@/components/ui/ReferenceSelect';
import { RotateCcw, Plus } from 'lucide-react';

interface ReferenceOption {
    id: string;
    name: string;
}

interface FiltersPanelProps {
    searchText: string;
    setSearchText: (value: string) => void;
    handleSearch: () => void;
    projectTypeId: string | null;
    setProjectTypeId: (value: string | null) => void;
    projectStatusId: string | null;
    setProjectStatusId: (value: string | null) => void;
    handleReset: () => void;
    handleCreate: () => void;
    projectTypes: { data: ReferenceOption[] | null; loading: boolean };
    projectStatuses: { data: ReferenceOption[] | null; loading: boolean };
}

export function FiltersPanel({
    searchText,
    setSearchText,
    handleSearch,
    projectTypeId,
    setProjectTypeId,
    projectStatusId,
    setProjectStatusId,
    handleReset,
    handleCreate,
    projectTypes,
    projectStatuses,
}: FiltersPanelProps) {
    return (
        <div className="px-5 py-4 mb-5 bg-white border border-gray-200 rounded-lg shadow-sm ">
            <div className="flex items-center justify-between gap-4">
                {/* Фильтры и поиск — слева */}
                <div className="flex items-center flex-1 gap-3">
                    <InputSearch
                        value={searchText}
                        onChange={setSearchText}
                        onEnter={handleSearch}
                    />

                    <ReferencesSelec
                        label="Тип проекта"
                        value={projectTypeId || ''}
                        onChange={setProjectTypeId}
                        options={projectTypes.data || []}
                        loading={projectTypes.loading}
                    />

                    <ReferenceSelect
                        label="Статус проекта"
                        value={projectStatusId || ''}
                        onChange={setProjectStatusId}
                        options={projectStatuses.data || []}
                        loading={projectStatuses.loading}
                    />

                    {/* Иконка сброса */}
                    <button
                        onClick={handleReset}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:text-blue-600 hover:bg-blue-50 group"
                        title="Сбросить фильтры и поиск"
                    >
                        <RotateCcw className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" />
                    </button>
                </div>

                {/* Кнопка "Создать" — справа */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Создать
                    </button>
                </div>
            </div>
        </div>
    );
}
