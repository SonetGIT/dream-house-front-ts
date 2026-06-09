export interface UnitFiltersState {
    sort: string;

    project_id: string;

    floor_from: string;
    floor_to: string;

    statuses: string[];

    lot_types: string[];

    rooms: string;
    rooms_from: string;
    rooms_to: string;

    area_from: string;
    area_to: string;

    price_from: string;
    price_to: string;

    price_per_m2_from: string;
    price_per_m2_to: string;

    manager_user_id: string;

    client_search: string;
    client_pin: string;
    client_passport: string;
}
interface UnitFiltersProps {
    filters: UnitFiltersState;
    projects: { id: number; name: string }[];
    managers: { id: number; full_name: string }[];

    onChange: (field: keyof UnitFiltersState, value: string | string[]) => void;

    onClose: () => void;
}
/***************************************************************************************************************/
export default function ObjectsOverviewUnitsFilters({
    filters,
    projects,
    managers,
    onChange,
    onClose,
}: UnitFiltersProps) {
    const toggleStatus = (status: string) => {
        const exists = filters.statuses.includes(status);

        onChange(
            'statuses',
            exists ? filters.statuses.filter((s) => s !== status) : [...filters.statuses, status],
        );
    };

    const toggleLotType = (type: string) => {
        const exists = filters.lot_types.includes(type);

        onChange(
            'lot_types',
            exists ? filters.lot_types.filter((s) => s !== type) : [...filters.lot_types, type],
        );
    };

    return (
        <div className="w-full max-w-sm text-white bg-slate-900">
            {/* Header */}

            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold">Фильтры лотов</h2>

                <button onClick={onClose} className="text-sm text-slate-300 hover:text-white">
                    Закрыть
                </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
                {/* Сортировка */}

                <div>
                    <label className="block mb-1 text-xs text-slate-300">Сортировка</label>

                    <select
                        value={filters.sort}
                        onChange={(e) => onChange('sort', e.target.value)}
                        className="w-full px-3 py-2 border rounded bg-slate-800 border-slate-700"
                    >
                        <option value="new">Новые</option>

                        <option value="price_asc">Цена ↑</option>

                        <option value="price_desc">Цена ↓</option>

                        <option value="area_desc">Площадь ↓</option>
                    </select>
                </div>

                {/* Объект */}

                <div>
                    <label className="block mb-1 text-xs text-slate-300">Объекты</label>

                    <select
                        value={filters.project_id}
                        onChange={(e) => onChange('project_id', e.target.value)}
                        className="w-full px-3 py-2 border rounded bg-slate-800 border-slate-700"
                    >
                        <option value="">Все объекты</option>

                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Этаж */}

                <div className="grid grid-cols-3 gap-2">
                    <input
                        placeholder="Этаж"
                        value={filters.rooms}
                        className="px-3 py-2 border rounded bg-slate-800 border-slate-700"
                    />

                    <input
                        placeholder="Этаж от"
                        value={filters.floor_from}
                        onChange={(e) => onChange('floor_from', e.target.value)}
                        className="px-3 py-2 border rounded bg-slate-800 border-slate-700"
                    />

                    <input
                        placeholder="Этаж до"
                        value={filters.floor_to}
                        onChange={(e) => onChange('floor_to', e.target.value)}
                        className="px-3 py-2 border rounded bg-slate-800 border-slate-700"
                    />
                </div>

                {/* Статусы */}

                <div>
                    <div className="mb-2 text-xs text-slate-300">Статусы лота</div>

                    <div className="flex flex-wrap gap-2">
                        {['free', 'reserved', 'sold', 'offmarket'].map((status) => (
                            <button
                                key={status}
                                onClick={() => toggleStatus(status)}
                                className={`px-3 py-2 text-sm rounded ${
                                    filters.statuses.includes(status)
                                        ? 'bg-blue-600'
                                        : 'bg-slate-800'
                                }`}
                            >
                                {status === 'free'
                                    ? 'Свободна'
                                    : status === 'reserved'
                                      ? 'Забронирована'
                                      : status === 'sold'
                                        ? 'Продана'
                                        : 'Снята'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Типы */}

                <div>
                    <div className="mb-2 text-xs text-slate-300">Типы лотов</div>

                    <div className="flex flex-wrap gap-2">
                        {[
                            {
                                value: 'apartment',
                                label: 'Квартира',
                            },
                            {
                                value: 'commercial',
                                label: 'Помещение',
                            },
                            {
                                value: 'parking',
                                label: 'Паркинг',
                            },
                            {
                                value: 'storage',
                                label: 'Кладовая',
                            },
                        ].map((type) => (
                            <button
                                key={type.value}
                                onClick={() => toggleLotType(type.value)}
                                className={`px-3 py-2 text-sm rounded ${
                                    filters.lot_types.includes(type.value)
                                        ? 'bg-blue-600'
                                        : 'bg-slate-800'
                                }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Площадь */}

                <div className="grid grid-cols-2 gap-2">
                    <input
                        placeholder="Площадь от"
                        value={filters.area_from}
                        onChange={(e) => onChange('area_from', e.target.value)}
                        className="px-3 py-2 border rounded bg-slate-800 border-slate-700"
                    />

                    <input
                        placeholder="Площадь до"
                        value={filters.area_to}
                        onChange={(e) => onChange('area_to', e.target.value)}
                        className="px-3 py-2 border rounded bg-slate-800 border-slate-700"
                    />
                </div>

                {/* Цена */}

                <div className="grid grid-cols-2 gap-2">
                    <input
                        placeholder="Цена от"
                        value={filters.price_from}
                        onChange={(e) => onChange('price_from', e.target.value)}
                        className="px-3 py-2 border rounded bg-slate-800 border-slate-700"
                    />

                    <input
                        placeholder="Цена до"
                        value={filters.price_to}
                        onChange={(e) => onChange('price_to', e.target.value)}
                        className="px-3 py-2 border rounded bg-slate-800 border-slate-700"
                    />
                </div>

                {/* Менеджер */}

                <select
                    value={filters.manager_user_id}
                    onChange={(e) => onChange('manager_user_id', e.target.value)}
                    className="w-full px-3 py-2 border rounded bg-slate-800 border-slate-700"
                >
                    <option value="">Все менеджеры</option>

                    {managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                            {manager.full_name}
                        </option>
                    ))}
                </select>

                {/* Клиент */}

                <input
                    placeholder="ФИО / телефон клиента"
                    value={filters.client_search}
                    onChange={(e) => onChange('client_search', e.target.value)}
                    className="w-full px-3 py-2 border rounded bg-slate-800 border-slate-700"
                />

                <div className="grid grid-cols-2 gap-2">
                    <input
                        placeholder="ПИН клиента"
                        value={filters.client_pin}
                        onChange={(e) => onChange('client_pin', e.target.value)}
                        className="px-3 py-2 border rounded bg-slate-800 border-slate-700"
                    />

                    <input
                        placeholder="Паспорт клиента"
                        value={filters.client_passport}
                        onChange={(e) => onChange('client_passport', e.target.value)}
                        className="px-3 py-2 border rounded bg-slate-800 border-slate-700"
                    />
                </div>
            </div>
        </div>
    );
}
