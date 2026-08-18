import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { Search, Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface FiltersPanelProps {
    refs: Record<string, ReferenceResult>;
    onSearch: (filters: { search: string; role_id: number | null }) => void;
    onReset: () => void;
    onCreate: () => void;
}

export default function UsersFiltersPanelMobileReset({
    refs,
    onSearch,
    onReset,
    onCreate,
}: FiltersPanelProps) {
    const [searchText, setSearchText] = useState('');
    const [roleId, setRoleId] = useState<number | null>(null);

    const handleSearch = () => {
        onSearch({ search: searchText, role_id: roleId });
    };

    const handleReset = () => {
        setSearchText('');
        setRoleId(null);
        onReset();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    '\u041f\u043e\u0438\u0441\u043a \u043f\u043e \u0424\u0418\u041e, \u043b\u043e\u0433\u0438\u043d\u0443, email...'
                                }
                                className="w-full py-2 pl-10 pr-4 text-sm text-gray-900 transition-all bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div className="w-[300px]">
                        <select
                            value={roleId || ''}
                            onChange={(e) =>
                                setRoleId(e.target.value ? Number(e.target.value) : null)
                            }
                            className="w-full px-3 py-2 text-sm text-gray-900 transition-all bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-transparent"
                        >
                            <option value="">
                                {'\u0412\u0441\u0435 \u0440\u043e\u043b\u0438'}
                            </option>
                            {refs.userRoles.data?.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:ring-offset-2"
                    >
                        {'\u041f\u043e\u0438\u0441\u043a'}
                    </button>
                    <StyledTooltip
                        title={
                            '\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u0444\u0438\u043b\u044c\u0442\u0440\u044b'
                        }
                    >
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
                        <span className="text-sm">
                            {'\u0421\u041e\u0417\u0414\u0410\u0422\u042c'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
